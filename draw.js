class Emoji {
  constructor() {
    const rand = [];
    rand.push(Math.random() * (emojiRender/2) + 1);
    rand.push(Math.random() * (emojiRender/2) + emojiRender);
    const unicodeRange = Math.floor(Math.random()*30+1).toString(16);
    this.text = `0x1f${Math.floor(Math.random()*4+3)}${parseInt(unicodeRange,16) < 16 ? '0'+unicodeRange : unicodeRange}`;
    this.orbit = (rand.reduce( (total, next) => total+next,0) / rand.length);
    this.opacity = Math.floor((1 - ((this.orbit) / emojiRender)) * emojiRender) + Math.floor(Math.random() * 80);
    this.Pos = {
      x: (BR.x/2),
      y: (BR.y/2) + this.orbit
    };

    this.pos = rotate(BR.x/2,BR.y/2, this.Pos.x, this.Pos.y, Math.PI * (Math.random()*2));
    this.realPos = this.Pos;

    this.rotateSpeed = (Math.random() * 0.0005 + (this.opacity/20000));

    this.waveSpeed = Math.random * 0.01;
    this.waveSpeed2 = Math.random * 0.01;
    this.wave = Math.sin(currentTime * this.waveSpeed) * hz;
    this.wave2 = Math.sin(currentTime * this.waveSpeed2) * hz;
    this.change = function() {
      const unicodeRange = Math.floor(Math.random()*30+1).toString(16);
      this.text = `0x1f${Math.floor(Math.random()*4+3)}${parseInt(unicodeRange,16) < 16 ? '0'+unicodeRange : unicodeRange}`;
    }
    emojis.push(this);
  }
}

function rotate(cx, cy, x, y, rad) {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let newX, newY;
  if(renderMode === 0) {
    newX = (cos * (x - cx)) - (sin * (y - cy)) + cx;
    newY = (cos * (y - cy)) + (sin * (x - cx)) + cy;
  } else if(renderMode === 1) {
    newX = (cos * (x - cx)) + (sin * (y - cy)) + cx;
    newY = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  } else if(renderMode === 2) {
    newX = (sin * (y + cx)) - (cos * (x - cy)) + cx;
    newY = (sin * (y - cx)) + (cos * (x - cy)) + cy;
  } else if(renderMode === 3) {
    newX = (cos * (x - cx)) - (sin * (y - cy)) + cx;
    newY = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  }
  
  return {x: newX, y: newY};
}

function getBodyRect() {
  const { width, height} = document.body.getBoundingClientRect();
  return { x: width, y: height };
}

const emojis = [];
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let BR = getBodyRect();
canvas.width = BR.x;
canvas.height = BR.y;
// canvas.style.cursor = 'none';
document.body.appendChild(canvas);
const hz = 60;
const startTime = new Date().getTime();
let emojiRender = BR.x/4;
let emojiCount = BR.x/2;
let currentTime = 0;
let nonClick = true;
let renderMode = 0;
let canvasPos = {
  x: 0,
  y: 0
};
function Draw(emoji) {
  ctx.font = `30px Arial`;
  ctx.fillStyle = 'rgba(0,0,0,1)';
  if(nonClick) {
    emoji.wave = Math.sin(currentTime * emoji.waveSpeed) * hz;
    emoji.wave2 = Math.sin(currentTime * emoji.waveSpeed2) * hz;
    emoji.opacity = Math.floor((1 - ((emoji.orbit) / emojiRender)) * emojiRender) + Math.floor(Math.random() * 80);
    emoji.realPos = rotate(BR.x/2, BR.y/2, emoji.pos.x, emoji.pos.y, emoji.rotateSpeed * currentTime);
  } else {
    emoji.realPos = rotate(BR.x/2, BR.y/2, canvasPos.x, canvasPos.y, emoji.rotateSpeed * currentTime);
  }
  ctx.fillText(String.fromCodePoint(emoji.text),emoji.realPos.x,emoji.realPos.y);
}

canvas.onmousemove = (ev) => {
  canvasPos.x = ev.clientX;
  canvasPos.y = ev.clientY;
}
canvas.onclick = () => {
  nonClick = !nonClick;
}

window.requestFrame = (function() {
  return  window.requestAnimationFrame       || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame    ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();

function render() {
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillRect(0,0,BR.x,BR.y);
  let now = new Date().getTime();
  currentTime = (now-startTime) / 10;
  if(emojiCount >= emojis.length){
    for(let i = 0; i<emojiCount; i++){
      new Emoji();
    }
  }

  for(var i=0; i<= emojis.length; i++){
    if(emojis[i]){
      Draw(emojis[i]);
    }
  }
  requestFrame(render);
}

render();

function reRender() {
  BR = getBodyRect();
  canvas.width = BR.x;
  canvas.height = BR.y;
  emojiRender = BR.x/4;
  emojiCount = BR.x/2;
  emojis.length = 0;
}

window.addEventListener('resize',function() {
  reRender();
});

window.addEventListener('keyup', ev => {
  switch(ev.keyCode){
    case 82:
      return emojis.map( emoji => emoji.change() );
    case 69:
      return renderMode = renderMode === 3 ? 0 : renderMode+1;
    default:
      return false;
  }
})