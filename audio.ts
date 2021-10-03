import { loadAudio } from './loader.js';

const soundMap = new Map<string, AudioBuffer>();
export const audioContext = new AudioContext();

export type BgmTrackName = keyof typeof bgm;
export type SfxName = keyof typeof sfx;

const bgm = {
  'crystal':'audio/The_Scientists_Crystalarium.mp3', 
  'banjo': 'audio/Banjo_Kablooie.mp3',
  'overworld': 'audio/overworld_song.mp3',
  'greenhouse': 'audio/Bach_Chorale.mp3',
  'attic': 'audio/Spooky_Attic.mp3',
};

const sfx = {
  'splat': 'audio/splat.ogg',
  'meow': 'audio/Meow_9.ogg',
  'mahp': 'audio/mahp.ogg',
  'great-jearb-06': 'audio/great-jearb-06.wav',
  'chimes-002': 'audio/Chimes-002.wav',
  'bad-job-4': 'audio/bad-job-4.wav',
};

for(const [name, url] of Object.entries({...bgm, ...sfx})) {
  loadSound(name, url);
}


export const bgmGainNode = audioContext.createGain();
bgmGainNode.gain.value = 0.5;
bgmGainNode.connect(audioContext.destination);

const sfxGainNode = audioContext.createGain();
sfxGainNode.gain.value = 0.5;
sfxGainNode.connect(audioContext.destination);

async function loadSound(name: string, url: string) {
  soundMap.set(name, await loadAudio(url, audioContext));
}

export function playSFX(name: SfxName) {
  return playSFXPitchShifted(name, 1);
}

export function playSFXPitchShifted(name: SfxName, shift: number) {
  const buffer = soundMap.get(name);
  if(!buffer) {
    console.error(`SFX track ${name} is not loaded`)
    return;
  }
  const sound = audioContext.createBufferSource();
  sound.buffer = buffer;
  sound.connect(sfxGainNode);
  sound.playbackRate.value = shift;
  sound.loop = false;
  sound.start(0);
  return sound;
}



export async function playSpeech(sampleName: SfxName, numberOfSamples: number, timeBetweenSamples: number, variance: number, shift: number) {
  for (let x=0; x<numberOfSamples; x++) {
    setTimeout(() => {
      const netShift = variance ** ((Math.random() * 2) - 1) * shift;

      playSFXPitchShifted(sampleName, netShift);
    }, timeBetweenSamples * x);
  }
}

let currentSpeech = 0;
let speechEmergencyTimeout = 0;
export async function startSpeech(sampleName: SfxName, timeBetweenSamples: number, variance: number, shift: number) {
  currentSpeech++;
  let validSpeech = currentSpeech;
  speechEmergencyTimeout = setTimeout(() => currentSpeech++, 5000);
  while (currentSpeech === validSpeech) {
    await new Promise((res, _rej) => {
      const netShift = variance ** ((Math.random() * 2) - 1) * shift;

      playSFXPitchShifted(sampleName, netShift);
      setTimeout(() => res(null), timeBetweenSamples);
    });
  }
  clearTimeout(speechEmergencyTimeout);
}

export function stopSpeech() {
  currentSpeech++;
  clearTimeout(speechEmergencyTimeout);
}

export class AudioHUD {
  private element = document.createElement('div');
  private _muteBgm = document.createElement('span');
  private _bgmSlider = document.createElement('input');
  private _muteSfx = document.createElement('span');
  private _sfxSlider = document.createElement('input');

  constructor() {
    this.element.classList.add('audioControlWrapper');
    this.element.addEventListener('mousedown', ev => {
      ev.stopPropagation();
    })
    document.body.appendChild(this.element);

    const bgmControls = document.createElement('div');
    this.element.appendChild(bgmControls);
    
    this._muteBgm.innerText = 'music_note';
    this._muteBgm.classList.add('material-icons-outlined')
    bgmControls.appendChild(this._muteBgm);

    this._bgmSlider.classList.add('audioRange')
    this._bgmSlider.setAttribute('type', 'range');
    this._bgmSlider.setAttribute('min', '0');
    this._bgmSlider.setAttribute('max', '1');
    this._bgmSlider.setAttribute('step', 'any');
    this._bgmSlider.addEventListener('change', ev => bgmGainNode.gain.value = Number((ev.target! as HTMLInputElement).value));
    bgmControls.appendChild(this._bgmSlider);

    const sfxControls = document.createElement('div');
    this.element.appendChild(sfxControls);
    
    this._muteSfx.innerText = 'volume_up';
    this._muteSfx.classList.add('material-icons-outlined')
    sfxControls.appendChild(this._muteSfx);

    this._sfxSlider.classList.add('audioRange')
    this._sfxSlider.setAttribute('type', 'range');
    this._sfxSlider.setAttribute('min', '0');
    this._sfxSlider.setAttribute('max', '1');
    this._sfxSlider.setAttribute('step', 'any');
    this._sfxSlider.addEventListener('change', ev => sfxGainNode.gain.value = Number((ev.target! as HTMLInputElement).value));
    sfxControls.appendChild(this._sfxSlider);
  }
}

new AudioHUD();

(window as any).playSpeech = playSpeech;
