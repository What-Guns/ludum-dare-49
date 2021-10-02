import { loadAudio } from './loader.js';

const bgm: {[k in string]: AudioTrack} = {};
const sfx: {[k in string]: AudioTrack} = {};
type AudioTrack = {
  url: string,
  buffer: AudioBuffer,
}


export const audioContext = new AudioContext();

const bgmGainNode = audioContext.createGain();
bgmGainNode.gain.value = 0.5;
bgmGainNode.connect(audioContext.destination);

const sfxGainNode = audioContext.createGain();
sfxGainNode.gain.value = 0.5;
sfxGainNode.connect(audioContext.destination);

let currentlyPlayingBGM: AudioBufferSourceNode = audioContext.createBufferSource();
currentlyPlayingBGM.start();

async function loadBGM(name:string, url: string) {
  async function loadIt() {
    const buffer = await loadAudio(url, audioContext);
    bgm[name] = {
      url,
      buffer,
    };
  }
  await loadIt();
}

async function loadSFX(name:string, url: string) {
  async function loadIt() {
    const buffer = await loadAudio(url, audioContext);
    sfx[name] = {
      url,
      buffer,
    };
  }
  await loadIt();
}

export function playBGM(name: string) {
  if (!bgm[name]) {
    console.error(`BGM track ${name} is not loaded`)
    return;
  }
  currentlyPlayingBGM.stop();
  const sound = audioContext.createBufferSource();
  sound.buffer = bgm[name].buffer;
  sound.connect(bgmGainNode);
  sound.loop = true;
  sound.start(0);
  currentlyPlayingBGM = sound;
}

export function playSFX(name: string) {
  return playSFXPitchShifted(name, 1);
}

export function playSFXPitchShifted(name: string, shift: number) {
  if (!sfx[name]) {
    console.error(`SFX track ${name} is not loaded`)
    return;
  }
  const sound = audioContext.createBufferSource();
  sound.buffer = sfx[name].buffer;
  sound.connect(sfxGainNode);
  sound.playbackRate.value = shift + 1;
  sound.loop = false;
  sound.start(0);
  return sound;
}


loadBGM('crystal', 'audio/The_Scientists_Crystalarium.mp3');
loadBGM('banjo', 'audio/Banjo_Kablooie.mp3');
loadSFX('splat', 'audio/splat.ogg');

async function playSpeech(sampleName: string, numberOfSamples: number, timeBetweenSamples: number, variance: number) {
  for (let x=0; x<numberOfSamples; x++) {
    setTimeout(() => {
      const shift = (Math.random() - 0.5) * variance;
      playSFXPitchShifted(sampleName, shift);
    }, timeBetweenSamples * x);
  }
}

export class AudioHUD {
  private element = document.createElement('div');
  private _muteBgm = document.createElement('span');
  private _bgmSlider = document.createElement('input');
  private _muteSfx = document.createElement('span');
  private _sfxSlider = document.createElement('input');

  constructor() {
    this.element.classList.add('audioControlWrapper');
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

(window as any).playBGM = playBGM;
(window as any).playSpeech = playSpeech;