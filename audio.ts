import { loadAudio } from './loader.js';

const bgm: {[k in string]: AudioTrack} = {};
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

export function playBGM(name: string) {
  if (!bgm[name]) {
    console.error(`Audio track ${name} is not loaded`)
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

(window as any).playBGM = playBGM;

loadBGM('crystal', 'audio/The_Scientists_Crystalarium.mp3');
loadBGM('banjo', 'audio/Banjo_Kablooie.mp3');