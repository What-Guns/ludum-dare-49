export function loadImage(url: string) {
  const img = document.createElement('img');
  img.src = url;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
  });
}

export async function loadAudio(url: string, ctx: AudioContext) {
  const rawDataPromise = fetch(url);
  return rawDataPromise.then(async response => {
    if(response.status < 200 || response.status > 400) {
      throw new Error(`Failed to load audio from ${url}`)
    }

    const buffer = await response.arrayBuffer();
    
    return new Promise<AudioBuffer>((resolve, reject) => {
      ctx.decodeAudioData(buffer, resolve, reject);
    });
  })
}

