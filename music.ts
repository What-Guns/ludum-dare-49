import {loadAudio} from './loader.js';
import {audioContext, bgmGainNode} from './audio.js';
import { getFlagValue } from './flags.js';

const unloadedBgm = {
  'overworld': 'audio/overworld_song.mp3',
  'greenhouse': 'audio/Bach_Chorale.mp3',
  'attic': 'audio/Spooky_Attic.mp3',
  'radio': 'audio/Radio_Tune.mp3',
  'plants': 'audio/plant_choire.mp3',
};

const loadedMusic = loadMusic();

type TrackName = keyof typeof unloadedBgm;

export class Music {
  readonly plantAnalyzer: AnalyserNode;

  private readonly overworldGain: GainNode;
  private readonly overworldFilter: BiquadFilterNode;
  private readonly plantGain: GainNode;
  private readonly plantPan: PannerNode;
  private readonly plantFilter: BiquadFilterNode;
  private readonly atticGain: GainNode;
  private readonly radioGain: GainNode;
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
    this.plantAnalyzer = audioContext.createAnalyser();
    this.plantAnalyzer.fftSize = 128;
    this.plantAnalyzer.connect(this.plantPan);
    this.plantGain = this.startTrack('plants', this.plantAnalyzer);
    this.atticGain = this.startTrack('attic', bgmGainNode);
    this.radioGain = this.startTrack('radio', bgmGainNode);
    this.roomChanged('hall', true);

    this.makeSlider('overworld gain', this.overworldGain.gain, 0, 1);
    this.makeSlider('overworld filter', this.overworldFilter.frequency, 0, this.overworldFilter.frequency.maxValue);
    this.makeSlider('plant gain', this.plantGain.gain, 0, 1);
    this.makeSlider('plant pan', this.plantPan.positionX, -2, 2);
    this.makeSlider('plant filter', this.plantFilter.frequency, 0, this.plantFilter.frequency.maxValue);
    this.makeSlider('attic gain', this.atticGain.gain, 0, 1);
    this.makeSlider('radio gain', this.radioGain.gain, 0, 1);
  }

  getMusicState(room: string) {
    let state = musicState[room];
    if (state) return state;
    let candidateStateNames = Object.keys(musicState).filter(ms => ms.includes(room));
    if (candidateStateNames.length === 0) return undefined;
    if (candidateStateNames.length === 1) return musicState[candidateStateNames[0]];
    candidateStateNames = candidateStateNames.filter(stateName => {
      const flagName = stateName.split(':')[1];
      return getFlagValue(flagName);
    });
    if (candidateStateNames.length === 0) return undefined;
    if (candidateStateNames.length > 1) console.warn(`More than one valid state found: ${candidateStateNames}`);
    return musicState[candidateStateNames[0]];
  }

  roomChanged(room: string, immediate = false) {
    const state = this.getMusicState(room);
    if(!state) {
      alert(`I don't know what ${room} should sound like`);
      return;
    }
    const now = audioContext.currentTime;
    if(immediate) {
      this.atticGain.gain.value = state.atticGain;
      this.overworldGain.gain.value = state.overworldGain;
      this.overworldFilter.frequency.value = state.overworldFilter;
      this.plantFilter.frequency.value = state.plantFilter;
      this.plantGain.gain.value = state.plantGain;
      this.plantPan.positionX.value = state.plantPan;
      this.radioGain.gain.value = state.radioGain;
    } else {
      const then = audioContext.currentTime + (immediate ? 0 : 1);
      this.fadeParam(this.atticGain.gain, state.atticGain, now, then);
      this.fadeParam(this.overworldGain.gain, state.overworldGain, now, then);
      this.fadeParam(this.overworldFilter.frequency, state.overworldFilter, now, then);
      this.fadeParam(this.plantFilter.frequency, state.plantFilter, now, then);
      this.fadeParam(this.plantGain.gain, state.plantGain, now, then);
      this.fadeParam(this.plantPan.positionX, state.plantPan, now, then);
      this.fadeParam(this.radioGain.gain, state.radioGain, now, then);
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
    source.start(audioContext.currentTime + 1);
    return gain;
  }

  static async create() {
    return new Music(await loadedMusic)
  }
}

const musicState: {[key: string]: MusicState} = {
  'foyer': {
    atticGain: 0,
    overworldFilter: 24000,
    overworldGain: 1,
    plantFilter: 100,
    plantGain: 0,
    plantPan: -2,
    radioGain: 0,
  },
  'hall': {
    atticGain: 0,
    overworldFilter: 24000,
    overworldGain: 1,
    plantFilter: 1180,
    plantGain: 0.45,
    plantPan: -1.5,
    radioGain: 0,
  },
  'greenhouse': {
    atticGain: 0,
    overworldFilter: 24000,
    overworldGain: 0.5,
    plantFilter: 24000,
    plantGain: 0.8,
    plantPan: 0,
    radioGain: 0,
  },
  'attic:radio-playing': {
    atticGain: 0,
    overworldGain: 0,
    overworldFilter: 24000,
    plantFilter: 1000,
    plantGain: 0,
    plantPan: 0,
    radioGain: 0.235,
  },
  'attic:!radio-playing': {
    atticGain: 0.235,
    overworldGain: 0,
    overworldFilter: 24000,
    plantFilter: 1000,
    plantGain: 0,
    plantPan: 0,
    radioGain: 0,
  },
  'cellar': {
    atticGain: 0,
    overworldFilter: 800,
    overworldGain: 0.6,
    plantFilter: 400,
    plantGain: 0.4,
    plantPan: 0,
    radioGain: 0,
  },
  'locked': {
    atticGain: 0,
    overworldFilter: 24000,
    overworldGain: 1,
    plantFilter: 1180,
    plantGain: 0.45,
    plantPan: -1.5,
    radioGain: 0,
  },
};

interface MusicState {
  atticGain: number;
  overworldFilter: number
  overworldGain: number;
  plantFilter: number;
  plantGain: number;
  plantPan: number;
  radioGain: number;
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
