export var debug = false;

addEventListener('keydown', evt => {
  if(evt.key === '`') debug = !debug;
})
