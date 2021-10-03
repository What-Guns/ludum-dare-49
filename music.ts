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
  private overworldFilter: BiquadFilterNode;
  private plantGain: GainNode;
  private plantPan: PannerNode;
  private plantFilter: BiquadFilterNode;
  private atticGain: GainNode;
  private readonly sliders = new Map<AudioParam, HTMLInputElement>();

  constructor(private readonly bgm: LoadedBgm) {
    this.overworldFilter = audioContext.createBiquadFilter();
    this.overworldFilter.connect(bgmGainNode);
    this.overworldGain = this.startTrack('overworld', this.overworldFilter);

    this.plantPan = audioContext.createPanner();
    this.plantFilter = audioContext.createBiquadFilter();
    this.plantFilter.connect(bgmGainNode);
    this.plantPan.connect(this.plantFilter);
    this.plantPan.panningModel = 'HRTF';
    this.plantPan.positionY.setValueAtTime(1, 0);
    this.plantGain = this.startTrack('plants', this.plantPan);
    this.atticGain = this.startTrack('attic', bgmGainNode);
    this.roomChanged('hall', true);

    this.makeSlider('overworld gain', this.overworldGain.gain, 0, 1);
    this.makeSlider('overworld filter', this.overworldFilter.frequency, 0, this.overworldFilter.frequency.maxValue);
    this.makeSlider('plant gain', this.plantGain.gain, 0, 1);
    this.makeSlider('plant pan', this.plantPan.positionX, -2, 2);
    this.makeSlider('plant filter', this.plantFilter.frequency, 0, this.plantFilter.frequency.maxValue);
    this.makeSlider('attic gain', this.atticGain.gain, 0, 1);
  }

  roomChanged(room: string, immediate = false) {
    const state = musicState[room];
    if(!state) {
      alert(`I don't know what ${room} should sound like`);
      return;
    }
    const now = audioContext.currentTime;
    if(immediate) {
      this.atticGain.gain.setValueAtTime(state.atticGain, now);
      this.overworldGain.gain.setValueAtTime(state.overworldGain, now);
      this.overworldFilter.frequency.setValueAtTime(state.overworldFilter, now);
      this.plantFilter.frequency.setValueAtTime(state.plantFilter, now);
      this.plantGain.gain.setValueAtTime(state.plantGain, now);
      this.plantPan.positionX.setValueAtTime(state.plantPan, now);
    } else {
      const then = audioContext.currentTime + (immediate ? 0 : 1);
      this.fadeParam(this.atticGain.gain, state.atticGain, now, then);
      this.fadeParam(this.overworldGain.gain, state.overworldGain, now, then);
      this.fadeParam(this.overworldFilter.frequency, state.overworldFilter, now, then);
      this.fadeParam(this.plantFilter.frequency, state.plantFilter, now, then);
      this.fadeParam(this.plantGain.gain, state.plantGain, now, then);
      this.fadeParam(this.plantPan.positionX, state.plantPan, now, then);
    }
  }

  private fadeParam(param: AudioParam, value: number, start: number, end: number) {
    param.setValueAtTime(param.value, start).linearRampToValueAtTime(value, end);
    const slider = this.sliders.get(param);
    if(slider) {
      slider.title = slider.value = value.toString();
    }
  }

  private makeSlider(name: string, param: AudioParam, min: number, max: number) {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = 'any';
    slider.addEventListener('input', () => {
      param.setValueAtTime(Number(slider.value), audioContext.currentTime);
      slider.title = slider.value;
    });
    const label = document.createElement('label');
    label.textContent = name;
    label.appendChild(slider);
    document.getElementById('audio-fieldset')!.appendChild(label);
    this.sliders.set(param, slider);
  }

  private startTrack(name: TrackName, destination: AudioNode) {
    const source = audioContext.createBufferSource();
    source.buffer = this.bgm[name];
    const gain = audioContext.createGain();
    source.connect(gain);
    gain.connect(destination);
    source.loop = true;
    source.start(0);
    return gain;
  }

  static async create() {
    return new Music(await loadedMusic)
  }
}

const musicState: {[key: string]: MusicState} = {
  'hall': {
    atticGain: 0,
    overworldFilter: 24000,
    overworldGain: 1,
    plantFilter: 600,
    plantGain: 1,
    plantPan: -1,
  },
  'greenhouse': {
    atticGain: 0,
    overworldFilter: 24000,
    overworldGain: 0.8,
    plantFilter: 24000,
    plantGain: 1,
    plantPan: 0,
  },
  'attic': {
    atticGain: 1,
    overworldGain: 0,
    overworldFilter: 24000,
    plantFilter: 1000,
    plantGain: 0,
    plantPan: 0,
  },
  'cellar': {
    atticGain: 0,
    overworldFilter: 800,
    overworldGain: 0.6,
    plantFilter: 400,
    plantGain: 0.4,
    plantPan: 0,
  },
};

interface MusicState {
  atticGain: number;
  overworldFilter: number
  overworldGain: number;
  plantFilter: number;
  plantGain: number;
  plantPan: number;
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
