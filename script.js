const mainCanvas = document.getElementById('main-canvas');
const speedCanvas = document.getElementById('speed-canvas');
const controlCanvas = document.getElementById('control-canvas');
/** @type {HTMLSelectElement} */
const select = document.getElementsByName('control')[0];

const moveData = {
  ddx: 0,
  ddy: 0,
  dx: 0,
  dy: 0,
  x: 0,
  y: 0,
  moveX: 0,
  moveY: 0,
  isMoving: false,
  prevMouseX: null,
  prevMouseY: null,
  currentOption: null,
};

let previousFrame = null;

function init() {
  draw();
  moveData.currentOption = select.value = 'acceleration';

  select.addEventListener('change', (event) => {
    moveData.currentOption = event.target.value;
  });
  controlCanvas.addEventListener('mousedown', (e) => {
    moveData.isMoving = true;
    moveData.prevMouseX = e.clientX;
    moveData.prevMouseY = e.clientY;
  });
  controlCanvas.addEventListener('mousemove', (e) => {
    if (moveData.isMoving) {
      moveData.moveX = e.clientX - moveData.prevMouseX;
      moveData.moveY = e.clientY - moveData.prevMouseY;
      switch (moveData.currentOption) {
        case 'position':
          moveData.x += moveData.moveX;
          moveData.y += moveData.moveY;
          break;
        case 'speed':
          moveData.dx += moveData.moveX;
          moveData.dy += moveData.moveY;
          break;
        case 'acceleration':
          moveData.ddx += moveData.moveX;
          moveData.ddy += moveData.moveY;
          break;
      }

      moveData.prevMouseX = e.clientX;
      moveData.prevMouseY = e.clientY;
    }
  });
  controlCanvas.addEventListener('mouseup', (e) => {
    moveData.isMoving = false;
    moveData.moveX = 0;
    moveData.moveY = 0;
  });
  controlCanvas.addEventListener('mouseleave', (e) => {
    moveData.isMoving = false;
    moveData.moveX = 0;
    moveData.moveY = 0;
  });

  document.getElementById('reset-button').addEventListener('click', () => {
    moveData.ddx = 0;
    moveData.ddy = 0;
    moveData.dx = 0;
    moveData.dy = 0;
    moveData.x = 0;
    moveData.y = 0;
  });
}

function draw(t) {
  const fps = 1000 / (t - previousFrame);
  previousFrame = t;

  if (fps) {
    control(fps);
    speed();
    main();
  }

  window.requestAnimationFrame(draw);
}

const width = 500;
const height = 500;

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} spacing
 * @returns
 */
function initCanvas(ctx, spacing) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.strokeRect(0, 0, width, height);

  const multiple = spacing / 50;
  const count = Math.ceil(Math.max(width, height) / spacing);
  const bias = width / 2 - spacing * Math.floor(count / 2);

  for (const x of [...Array(count)].map((_, i) => i * spacing + bias)) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(width, x);
    ctx.stroke();
  }

  ctx.restore();

  return multiple;
}

function drawCircle(ctx, x, y, multiple, radius) {
  ctx.beginPath();
  ctx.arc(
    x * multiple + width / 2,
    y * multiple + height / 2,
    radius,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} x
 * @param {*} y
 * @param {*} text
 */
function drawTextCenter(ctx, x, y, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 30%)';
  ctx.font = '50px arial';
  ctx.textAlign = 'center';

  ctx.fillText(text, x, y + ctx.measureText(text).actualBoundingBoxAscent / 2);
  ctx.restore();
}

function main() {
  /** @type {CanvasRenderingContext2D} */
  const ctx = mainCanvas.getContext('2d');
  const multiple = initCanvas(
    ctx,
    moveData.currentOption !== 'position' ? 10 : 50,
  );

  switch (moveData.currentOption) {
    case 'position':
      drawCircle(ctx, moveData.dx, moveData.dy, multiple, 6);
      drawTextCenter(ctx, 250, 250, 'speed');
      break;
    case 'speed':
    case 'acceleration':
      drawCircle(ctx, moveData.x, moveData.y, multiple, 6);
      drawTextCenter(ctx, 250, 250, 'position');
      break;
  }
}

function speed() {
  /** @type {CanvasRenderingContext2D} */
  const ctx = speedCanvas.getContext('2d');
  const multiple = initCanvas(
    ctx,
    moveData.currentOption === 'position' ? 10 : 50,
  );

  ctx.beginPath();
  switch (moveData.currentOption) {
    case 'position':
    case 'speed':
      drawCircle(ctx, moveData.ddx, moveData.ddy, multiple, 10);
      drawTextCenter(ctx, 250, 250, 'acceleration');
      break;
    case 'acceleration':
      drawCircle(ctx, moveData.dx, moveData.dy, multiple, 10);
      drawTextCenter(ctx, 250, 250, 'speed');
      break;
  }
  ctx.fill();
}

function lerp(a, b, f) {
  return a + f * (b - a);
}

function control(fps) {
  /** @type {CanvasRenderingContext2D} */
  const ctx = controlCanvas.getContext('2d');
  const multiple = initCanvas(
    ctx,
    moveData.currentOption !== 'position' ? 50 : 30,
  );

  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, width, height);

  ctx.beginPath();
  switch (moveData.currentOption) {
    case 'position':
      drawCircle(ctx, moveData.x, moveData.y, multiple, 5);

      // moveData.x += 100 / fps;
      // moveData.y += 100 / fps;
      // moveData.moveX = 100 / fps;
      // moveData.moveY = 100 / fps;

      const moveX = lerp(moveData.dx, moveData.moveX * fps, 0.5) - moveData.dx;
      const moveY = lerp(moveData.dy, moveData.moveY * fps, 0.5) - moveData.dy;

      // 가속도 == 속도 변화량 * fps == 속도 변화량 / 시간 변화량
      moveData.dx = lerp(moveData.dx, moveData.moveX * fps, 0.1);
      moveData.dy = lerp(moveData.dy, moveData.moveY * fps, 0.1);

      moveData.ddx = lerp(moveData.ddx, moveX * fps, 0.5);
      moveData.ddy = lerp(moveData.ddy, moveY * fps, 0.5);

      drawTextCenter(ctx, 250, 250, 'position');

      break;
    case 'speed':
      drawCircle(ctx, moveData.dx, moveData.dy, multiple, 5);

      // 가속도 == 속도 변화량 * fps == 속도 변화량 / 시간 변화량
      moveData.ddx = lerp(moveData.ddx, moveData.moveX * fps, 0.5);
      moveData.ddy = lerp(moveData.ddy, moveData.moveY * fps, 0.5);

      // without lerp
      // moveData.ddx = moveData.moveX * fps;
      // moveData.ddy = moveData.moveY * fps;

      // 속도 / fps == 속도 * 시간 == 위치 변화량
      moveData.x += moveData.dx / fps;
      moveData.y += moveData.dy / fps;

      drawTextCenter(ctx, 250, 250, 'speed');

      break;
    case 'acceleration':
      drawCircle(ctx, moveData.ddx, moveData.ddy, multiple, 5);

      // 가속도 / fps == 가속도 * 시간 == 속도 변화량
      moveData.dx += moveData.ddx / fps;
      moveData.dy += moveData.ddy / fps;

      // 속도 / fps == 속도 * 시간 == 위치 변화량
      moveData.x += moveData.dx / fps;
      moveData.y += moveData.dy / fps;

      drawTextCenter(ctx, 250, 250, 'acceleration');

      break;
  }
  ctx.fill();

  ctx.restore();
}

init();
