import { loadAudio } from './loader.js';

const bgm: {[k in string]: AudioTrack} = {};
const sfx: {[k in string]: AudioTrack} = {};
type AudioTrack = {
  url: string,
  buffer: AudioBuffer,
}


export const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
gainNode.gain.value = 0.5;
gainNode.connect(audioContext.destination);

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
  sound.connect(gainNode);
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
  sound.connect(gainNode);
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
//setTimeout(() => playSpeech('splat', 15, 150, 0.4), 3000);

(window as any).playBGM = playBGM;
(window as any).playSpeech = playSpeech;