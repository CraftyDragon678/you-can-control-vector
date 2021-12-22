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
      switch (moveData.currentOption) {
        case 'position':
          moveData.x += e.clientX - moveData.prevMouseX;
          moveData.y += e.clientY - moveData.prevMouseY;
          break;
        case 'speed':
          moveData.dx += e.clientX - moveData.prevMouseX;
          moveData.dy += e.clientY - moveData.prevMouseY;
          break;
        case 'acceleration':
          moveData.ddx += e.clientX - moveData.prevMouseX;
          moveData.ddy += e.clientY - moveData.prevMouseY;
          break;
      }

      moveData.prevMouseX = e.clientX;
      moveData.prevMouseY = e.clientY;
    }
  });
  controlCanvas.addEventListener('mouseup', (e) => {
    moveData.isMoving = false;
  });
  controlCanvas.addEventListener('mouseleave', (e) => {
    moveData.isMoving = false;
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

function main() {
  /** @type {CanvasRenderingContext2D} */
  const ctx = mainCanvas.getContext('2d');
  const multiple = initCanvas(
    ctx,
    moveData.currentOption !== 'position' ? 30 : 50,
  );

  switch (moveData.currentOption) {
    case 'position':
      drawCircle(ctx, moveData.dx, moveData.dy, multiple, 6);
      break;
    case 'speed':
    case 'acceleration':
      drawCircle(ctx, moveData.x, moveData.y, multiple, 6);
      break;
  }
}

function speed() {
  /** @type {CanvasRenderingContext2D} */
  const ctx = speedCanvas.getContext('2d');
  const multiple = initCanvas(ctx, 50);

  ctx.beginPath();
  switch (moveData.currentOption) {
    case 'position':
    case 'speed':
      drawCircle(ctx, moveData.ddx, moveData.ddy, multiple, 10);
      break;
    case 'acceleration':
      drawCircle(ctx, moveData.dx, moveData.dy, multiple, 10);
      break;
  }
  ctx.fill();
}

function control(fps) {
  /** @type {CanvasRenderingContext2D} */
  const ctx = controlCanvas.getContext('2d');
  const multiple = initCanvas(ctx, 50);

  ctx.save();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, width, height);

  ctx.beginPath();
  switch (moveData.currentOption) {
    case 'position':
      ctx.arc(
        moveData.x * multiple + width / 2,
        moveData.y * multiple + width / 2,
        5,
        0,
        2 * Math.PI,
      );
      break;
    case 'speed':
      ctx.arc(
        moveData.dx * multiple + width / 2,
        moveData.dy * multiple + width / 2,
        5,
        0,
        2 * Math.PI,
      );
      break;
    case 'acceleration':
      ctx.arc(
        moveData.ddx * multiple + width / 2,
        moveData.ddy * multiple + width / 2,
        5,
        0,
        2 * Math.PI,
      );
      break;
  }
  ctx.fill();

  // 가속도 / fps == 속도 변화량
  // moveData.dx += moveData.ddx / fps;
  // moveData.dy += moveData.ddy / fps;

  // 속도 / fps == 위치 변화량
  // moveData.x += moveData.dx / fps;
  // moveData.y += moveData.dy / fps;

  // 가속도 == 속도 변화량 / fps

  ctx.restore();
}

init();
