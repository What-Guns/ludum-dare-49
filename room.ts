import {AnimatedObject} from './animated-object.js';
import {Portal} from './door.js';
import {Npc} from './npc.js';
import {Player} from './player.js';
import {Serializable, serialize, isSerializable, deserialize, pluck} from './serialization.js';
import {Thing} from './main.js';
import {debug} from './debug.js';
import {loadImages} from './loader.js';
import {ofType, Type} from './crap.js';
import {pointer} from './input.js';
import {translateAndScalePopupContainer, resizePopupContainer} from './hud.js';
import { RpgTextBox } from "./rpgTextBox.js";
import { startSpeech, stopSpeech} from "./audio.js";
import {toast} from './toast.js';
import { puzzleObjects } from './puzzleObject.js';
import { getProgressLevel, getProgressLevelIndex, increaseProgressLevelName } from './progressManager.js';

@Serializable('./room.js')
export class Room {
  readonly name: string;
  readonly interacts?: string[];
  readonly width: number;
  readonly height: number;
  readonly vanishingPoint: {x: number, y: number};
  readonly camera = {x: 0, scale: 1};
  readonly floorHeight: number;
  readonly portals: Portal[] = [];
  readonly pointer = {x: pointer.x, y: pointer.y};

  private _cursor = 'default';
  private _animationTimer = 0;
  private _animationIndex = 0;

  get cursor() {
    return this._cursor;
  }

  set cursor(cursor: string) {
    if(this._cursor !== cursor) window.game!.canvas.style.cursor = cursor;
    this._cursor = cursor;
  }

  private readonly things: Thing[] = [];

  pattern?: CanvasPattern;

  player?: Player;

  constructor(private readonly background: CanvasImageSource[], private readonly roomData: RoomData) {
    this.name = roomData.name;
    this.width = roomData.width;
    this.height = roomData.height;
    this.vanishingPoint = roomData.vanishingPoint;
    this.interacts = roomData.interacts;
    this.floorHeight = roomData.floorHeight;
  }

  static async deserialize(roomData: RoomData) {
    const background = await loadImages(roomData.background);
    const room = new this(background, roomData);
    for(const thing of await Promise.all(roomData.things.map(x => deserialize(x, {room}) as Promise<Thing>))) {
      room.adoptThing(thing);
    }
    return Promise.resolve(room);
  }

  adoptThing(thing: Thing) {
    this.things.push(thing);
    this.things.sort(byZIndex);
    thing.room = this;
    if(thing instanceof Player) this.player = thing;
    if(thing instanceof Portal) this.portals.push(thing);
  }

  disown(thing: Thing) {
    if(thing instanceof Portal) {
      throw new TypeError(`Cannot remove doors from rooms`);
    }
    if(thing === this.player) this.player = undefined;
    const index = this.things.indexOf(thing);
    if(index === -1) throw new Error(`Trying to get a room to disown something it doesn't own`);
    this.things.splice(index, 1);
  }

  serialize(): RoomData {
    return {
      ...pluck(this, 'name', 'width', 'height', 'vanishingPoint', 'floorHeight'),
      background: this.roomData.background,
      interacts: this.roomData.interacts,
      things: (this.things as object[]).filter(isSerializable).map(serialize),
    };
  }

  tick(dt: number) {
    this.transformPointer();
    for(const thing of this.things) {
      thing.tick?.(dt);
    }
    this._animationTimer -= dt;
    if (this._animationTimer <= 0) {
      this._animationIndex++;
      this._animationIndex %= this.background.length;
      this._animationTimer = (Math.random() * 0.7) + 0.2
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.doCameraStuff(ctx);
    ctx.translate(this.camera.x, 0);
    ctx.scale(this.camera.scale, this.camera.scale);
    //this.pattern = this.pattern ?? ctx.createPattern(this.background, 'no-repeat')!;
    this.pattern = ctx.createPattern(this.background[this._animationIndex], 'no-repeat')!;
    ctx.fillStyle = this.pattern!;
    ctx.fillRect(0, 0, this.width, this.height);
    for(const thing of this.things) {
      thing.draw?.(ctx);
    }
    ctx.restore();
    if(debug) {
      ctx.font = '24px sans-serif';
      ctx.fillText(this.name, this.width / 2, 48);
    }

    ctx.canvas.style.cursor = this.things.some(t => t.isUnderPointer?.(this.pointer.x, this.pointer.y)) ? 'pointer' : '';
  }

  doClick() {
    const transformedX = (pointer.x - this.camera.x) / this.camera.scale;
    const transformedY = pointer.y / this.camera.scale;
    for(let i = this.things.length - 1; i >= 0; i--) {
      let thing = this.things[i];
      if(thing.doClick?.(transformedX, transformedY)) return;
    }
    const boundarySize = 250
    const clampedX = Math.max(boundarySize, Math.min(transformedX, this.width - boundarySize));
    this.things.find((t): t is Player => t instanceof Player)?.moveToCursor(clampedX);
  }

  activate() {
    this.things.forEach(t => t.startDrawingDOM?.());
    resizePopupContainer(this);
  }

  deactivate() {
    this.things.forEach(t => t.stopDrawingDOM ? t.stopDrawingDOM() : null);
    this.player = undefined;
  }

  getThingUnderCursor() {
    const transformedX = (pointer.x - this.camera.x) / this.camera.scale;
    const transformedY = pointer.y / this.camera.scale;
    return this.things.find(thing => thing.isUnderPointer?.(transformedX, transformedY));
  }

  getObjectsOfType<T extends Thing>(t: Type<T>) {
    return this.things.filter(ofType(t));
  }

  handleLockedDoor(_targetRoom: string) {
    toast('Locked');
  }

  private transformPointer() {
    this.pointer.x = (pointer.x - this.camera.x) / this.camera.scale;
    this.pointer.y = pointer.y / this.camera.scale;
  }

  private doCameraStuff(ctx: CanvasRenderingContext2D) {
    this.camera.scale = Math.min(ctx.canvas.height / this.height, 1);
    if(!this.player) return;
    const xAmount = this.player.x / this.width;
    const xOverflow = (this.width * this.camera.scale) - ctx.canvas.width;
    if(xOverflow < 0) {
      this.camera.x = -xOverflow/2;
    } else {
      this.camera.x = xOverflow * -xAmount;
    }
    translateAndScalePopupContainer(this);
  }
}

@Serializable('./room.js')
export class Hall extends Room {
  private readonly textbox: RpgTextBox = new RpgTextBox(() => {
    if (getProgressLevel() >= getProgressLevelIndex('recovered-hushroom') && getProgressLevel() < getProgressLevelIndex('returned-radio')) this.giveRadio();
    stopSpeech();
  });

  private hatchAnimation?: AnimatedObject;

  constructor(background: CanvasImageSource[], roomData: RoomData) {
    super(background, roomData);
  }

  override activate() {
    if(!this.hatchAnimation) {
      const animatedObjects = this.getObjectsOfType(AnimatedObject);
      if(animatedObjects.length !== 1) throw new Error(`Expected to find exactly one animated object in the hall`);
      this.hatchAnimation = animatedObjects[0];
    }
  }

  override handleLockedDoor(targetRoom: string) {
    if(targetRoom !== 'attic') {
      super.handleLockedDoor(targetRoom);
      return;
    }

    if(this.player!.hasPuzzleObject(puzzleObjects['fixed-radio'])) {
      this.player!.tossPuzzleObject(puzzleObjects['fixed-radio']);
      this.textbox.imageSrc = Npc.textBoxImages['GHOST'];
      this.textbox.visible = true;
      this.textbox.placement = 'bottom';
      this.textbox.textContent = 'You fixed my radio! Thanks a bundle! Come on up!';
      stopSpeech();
      const { sample, timeBetweenSamples, variance, shift } = Npc.speechParams['GHOST'];
      startSpeech(sample, timeBetweenSamples, variance, shift);

      increaseProgressLevelName('returned-radio');
      return;
    }

    this.hatchAnimation!.t = 0;
    this.hatchAnimation!.animating = true;
    this.textbox.imageSrc = Npc.textBoxImages['GHOST'];
    this.textbox.visible = true;
    this.textbox.placement = 'bottom';
    this.textbox.textContent = '< angry ghost noises >';
    
    stopSpeech();
    const { sample, timeBetweenSamples, variance, shift } = Npc.speechParams['GHOST'];
    startSpeech(sample, timeBetweenSamples, variance, shift);
  }

  override deactivate() {
    this.textbox.visible = false;
    super.deactivate();
  }

  override tick(dt: number) {
    super.tick(dt);
    this.textbox.tick(dt);
  }

  private giveRadio() {
    const brokenRadio = puzzleObjects['broken-radio'];
    const fixedRadio = puzzleObjects['fixed-radio'];

    const player = this.player;
    if(!player) return;
    if(player.hasPuzzleObject(brokenRadio) || player.hasPuzzleObject(fixedRadio)) return;
    player.takePuzzleObject(puzzleObjects['broken-radio']);
  }
}

export interface RoomData {
  name: string;
  interacts?: string[];
  background: string[];
  things: object[];
  width: number;
  height: number;
  vanishingPoint: {x: number, y: number};
  floorHeight: number;
}

function byZIndex(a: Thing, b: Thing) {
  if(a.z == null) {
    console.error(`Thing ${a} has no z coordinate`);
    return 0;
  }
  if(b.z == null) {
    console.error(`Thing ${b} has no z coordinate`);
    return 0;
  }
  return a.z - b.z;
}
