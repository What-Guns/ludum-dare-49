export function loadImage(url: string) {
  const img = document.createElement('img');
  img.src = url;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
  });
}

export async function loadAudio(url: string, ctx: AudioContext) {
  const response = await fetch(url);
  if(!response.ok) {
    throw new Error(`Failed to load audio from ${url}`)
  }

  const buffer = await response.arrayBuffer();

  return await ctx.decodeAudioData(buffer);
}

export async function loadObject(url: string) {
  const response = await fetch(url);
  if(!response.ok) return Promise.reject(response.text())
  return await response.json();
}
