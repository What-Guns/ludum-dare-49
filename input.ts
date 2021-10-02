export const pointer = {
  identifier: 0,
  x: 0,
  y: 0,
  active: false,
}

function touched(evt: TouchEvent) {
  const touch = getRelevantTouch(evt);
  if(!touch) return;
  pointer.identifier = touch.identifier;
  pointer.x = touch.pageX;
  pointer.y = touch.pageY;
  pointer.active = true;
}

function touchend(evt: TouchEvent) {
  if(getRelevantTouch(evt)) {
    pointer.active = false;
  }
}

function mouseClicked(evt: MouseEvent) {
  pointer.active = true;
  pointer.x = evt.pageX;
  pointer.y = evt.pageY;
  pointer.identifier = -1;
}

function mouseMoved(evt: MouseEvent) {
  pointer.x = evt.pageX;
  pointer.y = evt.pageY;
}

function mouseUnclicked(evt: MouseEvent) {
  pointer.active = false;
  pointer.x = evt.pageX;
  pointer.y = evt.pageY;
  pointer.identifier = -1;
}

function getRelevantTouch(evt: TouchEvent) {
  if(!pointer.active) return evt.changedTouches.item(0);
  for(let i = 0; i < evt.changedTouches.length; i++) {
    const touch = evt.changedTouches.item(i);
    if(!touch) return;
    if(touch.identifier === pointer.identifier) return touch;
  }

  return null;
}

export function init(canvas: HTMLElement) {
  canvas.addEventListener('touchstart', evt => {
    evt.preventDefault();
    touched(evt);
  });

  canvas.addEventListener('touchmove', evt => {
    evt.preventDefault();
    touched(evt);
  });

  canvas.addEventListener('touchend', touchend);

  canvas.addEventListener('mousedown', mouseClicked);

  canvas.addEventListener('mousemove', mouseMoved);

  canvas.addEventListener('mouseup', mouseUnclicked);
}
