const BACKGROUND_COLOR = "#101010";
const FOREGROUND_COLOR = "#BC13FE";

console.log(game);
game.width = 800;
game.height = 600;

const ctx = game.getContext("2d");
console.log(ctx);

function clear() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, game.width, game.height);
}
function point({ x, y }) {
  const size = 10;
  ctx.fillStyle = FOREGROUND_COLOR;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

function screen(p) {
  // - 1... 1 -> 0.... w/h
  const x = ((p.x + 1) / 2) * game.width;
  const y = (1 - (p.y + 1) / 2) * game.height;
  return { x, y };
}

function project({ x, y, z }) {
  return {
    x: x / z,
    y: y / z,
  };
}
function drawUI() {
  ctx.save();

  // Font stack: tries to find Consolas first, then falls back to others
  ctx.font = "bold 36px 'Consolas', 'Monaco', 'Courier New', monospace";
  ctx.fillStyle = FOREGROUND_COLOR; // Keep it yellow to match the model
  ctx.textAlign = "center";
  ctx.textBaseline = "top"; // Aligns from the top for easier positioning

  // Draw the text
  ctx.fillText("I LOVE 3D", game.width / 2, 30);

  // Optional: Add a subtle "terminal" glow
  ctx.shadowColor = FOREGROUND_COLOR;
  ctx.shadowBlur = 10;

  // Optional: Draw a "cursor" underscore that blinks
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    const textWidth = ctx.measureText("I LOVE 3D").width;
    ctx.fillRect(game.width / 2 + textWidth / 2 + 5, 35, 15, 30);
  }

  ctx.restore();
}
const FPS = 60;
let dz = 2;
let angle = 0;

let modelData = { vertices: [], faces: [] };
async function loadModel() {
  const response = await fetch("model_datas2.json");
  modelData = await response.json();
  frame();
}
// const vs = [
//   { x: 0.25, y: 0.25, z: 0.25 },
//   { x: -0.25, y: 0.25, z: 0.25 },
//   { x: -0.25, y: -0.25, z: 0.25 },
//   { x: 0.25, y: -0.25, z: 0.25 },

//   { x: 0.25, y: 0.25, z: -0.25 },
//   { x: -0.25, y: 0.25, z: -0.25 },
//   { x: -0.25, y: -0.25, z: -0.25 },
//   { x: 0.25, y: -0.25, z: -0.25 },
// ];

// const faces = [
//   [0, 1, 2, 3],
//   [4, 5, 6, 7],
//   [0, 4],
//   [1, 5],
//   [2, 6],
//   [3, 7],
// ];

function translate_z({ x, y, z }, dz) {
  return { x, y, z: z + dz };
}
function rotate_xz({ x, y, z }, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - z * sin,
    y: y,
    z: z * cos + x * sin,
  };
}
function line(p1, p2) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = FOREGROUND_COLOR;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = FOREGROUND_COLOR;
  ctx.stroke();
}
function frame() {
  const dt = 1 / FPS;
  dz += 0.1 * dt;
  angle += Math.PI * dt * 0.4;
  clear();
  drawUI();

  //   for (const v of vs) {
  //     point(screen(project(translate_z(rotate_xz(v, angle), dz))));
  //   }
  for (const face of modelData.faces) {
    for (let i = 0; i < face.length; i++) {
      const v1 = modelData.vertices[face[i]];
      const v2 = modelData.vertices[face[(i + 1) % face.length]];
      line(
        screen(project(translate_z(rotate_xz(v1, angle), dz))),
        screen(project(translate_z(rotate_xz(v2, angle), dz))),
      );
    }
  }

  setTimeout(frame, 1000 / FPS);
}

//frame();
loadModel();
