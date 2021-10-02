export function loadImage(url: string) {
  const img = document.createElement('img');
  img.src = url;
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
  });
}

