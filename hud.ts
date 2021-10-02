class HudWindow {
  private element: HTMLElement;
  private visible: boolean;
  x = 0;
  y = 0;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.left = String(this.x);
    this.element.style.right = String(this.y);
    this.element.innerText = 'Hello';
    this.element.classList.add('hudWindow');
    this.visible = true;
    document.body.appendChild(this.element);
  }

  draw(_ctx: CanvasRenderingContext2D) {
    if (!this.visible) {
      this.element.style.visibility = 'hidden';
      return;
    }
    this.element.style.visibility = 'visible';
    this.element.style.left = String(this.x) + "px";
    this.element.style.top = String(this.y) + "px";
  }
}
export { HudWindow }