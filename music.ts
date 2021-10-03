import {loadAudio} from './loader.js';
import {audioContext, bgmGainNode} from './audio.js';

const unloadedBgm = {
  'overworld': 'audio/overworld_song.mp3',
  'greenhouse': 'audio/Bach_Chorale.mp3',
  'attic': 'audio/Spooky_Attic.mp3',
  'plants': 'audio/plant_choire.mp3',
};

const loadedMusic = loadMusic();

type TrackName = keyof typeof unloadedBgm;

export class Music {
  private overworldGain: GainNode;
  private plantGain: GainNode;
  private plantPan: PannerNode;
  private plantFilter: BiquadFilterNode;
  private atticGain: GainNode;

  constructor(private readonly bgm: LoadedBgm) {
    this.overworldGain = this.startTrack('overworld', bgmGainNode);
    this.plantPan = audioContext.createPanner();
    this.plantFilter = audioContext.createBiquadFilter();
    this.plantFilter.connect(bgmGainNode);
    this.plantPan.connect(this.plantFilter);
    this.plantPan.panningModel = 'HRTF';
    this.plantPan.positionY.setValueAtTime(1, 0);
    this.plantGain = this.startTrack('plants', this.plantPan);
    this.atticGain = this.startTrack('attic', bgmGainNode);
    this.roomChanged('hall', true);
  }

  roomChanged(room: string, immediate = false) {
    const state = musicState[room];
    if(!state) {
      alert(`I don't know what ${room} should sound like`);
      return;
    }
    const now = audioContext.currentTime;
    if(immediate) {
      this.overworldGain.gain.setValueAtTime(state.overworldGain, now);
      this.plantGain.gain.setValueAtTime(state.plantGain, now);
      this.plantPan.positionX.setValueAtTime(state.plantPan, now);
      this.plantFilter.frequency.setValueAtTime(state.plantFilter, now);
      this.atticGain.gain.setValueAtTime(state.atticGain, now);
    } else {
      const then = audioContext.currentTime + (immediate ? 0 : 1);
      this.fadeParam(this.overworldGain.gain, state.overworldGain, now, then);
      this.fadeParam(this.plantGain.gain, state.plantGain, now, then);
      this.fadeParam(this.plantPan.positionX, state.plantPan, now, then);
      this.fadeParam(this.plantFilter.frequency, state.plantFilter, now, then);
      this.fadeParam(this.atticGain.gain, state.atticGain, now, then);
    }
  }

  private fadeParam(param: AudioParam, value: number, start: number, end: number) {
    param.setValueAtTime(param.value, start).linearRampToValueAtTime(value, end);
  }

  private startTrack(name: TrackName, destination: AudioNode) {
    const source = audioContext.createBufferSource();
    source.buffer = this.bgm[name];
    const gain = audioContext.createGain();
    source.connect(gain);
    gain.connect(destination);
    source.start(0);
    return gain;
  }

  static async create() {
    return new Music(await loadedMusic)
  }
}

const musicState: {[key: string]: MusicState} = {
  'hall': {
    overworldGain: 1,
    plantGain: 1,
    plantPan: -1,
    plantFilter: 600,
    atticGain: 0,
  },
  'greenhouse': {
    overworldGain: 1,
    plantGain: 1,
    plantPan: 0,
    plantFilter: 24000,
    atticGain: 0,
  },
  'attic': {
    overworldGain: 0,
    plantGain: 0,
    plantPan: 0,
    plantFilter: 1000,
    atticGain: 1,
  },
  'cellar': {
    overworldGain: 0,
    plantGain: 0.4,
    plantPan: 0,
    plantFilter: 400,
    atticGain: 0,
  },
};

interface MusicState {
  plantGain: number;
  plantPan: number;
  plantFilter: number;
  overworldGain: number;
  atticGain: number;
}

type LoadedBgm = {[key in TrackName]: AudioBuffer};

async function loadMusic(): Promise<LoadedBgm> {
  console.time('load music');
  const entries = await Promise.all(Object.entries(unloadedBgm).map(async ([name, url]) => {
    return [name, await loadAudio(url, audioContext)];
  }));
  console.timeEnd('load music');
  return Object.fromEntries(entries);
}
