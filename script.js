const mainCanvas = document.getElementById("main-canvas");
const speedCanvas = document.getElementById("speed-canvas");
const controlCanvas = document.getElementById("control-canvas");

const moveData = {
  dx: 0,
  dy: 0,
  x: 250,
  y: 250,
  isMoving: false,
  prevMouseX: null,
  prevMouseY: null,
};

let previousFrame = null;

function init() {
  draw();
  controlCanvas.addEventListener('mousedown', (e) => {
    moveData.isMoving = true;
    moveData.prevMouseX = e.clientX;
    moveData.prevMouseY = e.clientY;
  });
  controlCanvas.addEventListener('mousemove', (e) => {
    if (moveData.isMoving) {
      moveData.dx += e.clientX - moveData.prevMouseX;
      moveData.dy += e.clientY - moveData.prevMouseY;

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

  document.getElementById("reset-button").addEventListener('click', () => {
    moveData.dx = 0;
    moveData.dy = 0;
    moveData.x = 250;
    moveData.y = 250;
  });
}

function draw(t) {
  const fps = 1000 / (t - previousFrame);
  previousFrame = t;
  console.log(fps);

  if (fps) {
    control(fps);
    speed();
  }

  window.requestAnimationFrame(draw);
}

function speed() {
  /** @type {CanvasRenderingContext2D} */
  const ctx = speedCanvas.getContext("2d");
  const width = 500;
  const height = 500;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeRect(0, 0, width, height);

  for (const x of [...Array(9)].map((_, i) => i * 50 + 50)) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(width, x);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(moveData.x, moveData.y, 10, 0, 2 * Math.PI);
  ctx.fill();
}

function control(fps) {
  /** @type {CanvasRenderingContext2D} */
  const ctx = controlCanvas.getContext("2d");
  const width = 200;
  const height = 200;


  ctx.clearRect(0, 0, width, height);
  ctx.strokeRect(0, 0, width, height);

  for (const x of [...Array(3)].map((_, i) => i * 50 + 50)) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(width, x);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(moveData.dx + width / 2, moveData.dy + width / 2, 5, 0, 2 * Math.PI);
  ctx.fill();

  moveData.x += moveData.dx / fps;
  moveData.y += moveData.dy / fps;
}

init();
