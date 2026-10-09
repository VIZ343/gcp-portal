import { animate, stagger } from "../assets/vendor/anime.esm.js";

const backgroundHost = document.querySelector('[data-gcp-background]');

if (!backgroundHost) {
  throw new Error('GCP Background: no se encontró [data-gcp-background].');
}

backgroundHost.innerHTML = `
  <div class="atmosphere atmosphere-a"></div>
  <div class="atmosphere atmosphere-b"></div>
  <div class="atmosphere atmosphere-c"></div>
  <div class="atmosphere atmosphere-d"></div>
  <svg id="technical-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="revealGradient">
        <stop offset="0%" stop-color="white" stop-opacity="1" />
        <stop offset="46%" stop-color="white" stop-opacity="0.92" />
        <stop offset="78%" stop-color="white" stop-opacity="0.28" />
        <stop offset="100%" stop-color="black" stop-opacity="0" />
      </radialGradient>
      <mask id="cursorMask" maskUnits="userSpaceOnUse">
        <rect width="1600" height="900" fill="black" />
        <circle id="revealCircle" cx="800" cy="450" r="0" fill="url(#revealGradient)" />
      </mask>
      <marker id="arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 Z" fill="#5a7185" opacity="0.26" />
      </marker>
      <g id="baseTechnical">
        <path d="M120 690 C330 610 530 580 720 610" class="technical-light base-drift" />
        <path d="M980 260 C1190 235 1370 275 1490 355" class="technical-light base-drift" />
        <path d="M245 190 A310 310 0 0 1 545 430" class="technical-dashed base-drift" />
        <line x1="1160" y1="690" x2="1470" y2="690" class="axis base-drift" />
        <line x1="330" y1="120" x2="330" y2="335" class="technical-light base-drift" />
        <g transform="translate(235 235)">
          <line x1="-10" y1="0" x2="10" y2="0" class="cross" />
          <line x1="0" y1="-10" x2="0" y2="10" class="cross" />
        </g>
        <g transform="translate(1325 620)">
          <line x1="-10" y1="0" x2="10" y2="0" class="cross" />
          <line x1="0" y1="-10" x2="0" y2="10" class="cross" />
        </g>
      </g>
    </defs>
    <g id="base-layer"><use href="#baseTechnical" /></g>
    <g id="generated-layer"></g>
    <g id="reveal-layer" mask="url(#cursorMask)"></g>
  </svg>
`;


const svg = document.querySelector("#technical-svg");
const generatedLayer = document.querySelector("#generated-layer");
const revealLayer = document.querySelector("#reveal-layer");
const revealCircle = document.querySelector("#revealCircle");
const NS = "http://www.w3.org/2000/svg";

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CONFIG = {
  maxActive: 16,
  spawnMin: 220,
  spawnMax: 700,
  lifeMin: 2800,
  lifeMax: 5600,
  revealRadius: 275,
  centerSafeZone: { x1: 540, x2: 1060, y1: 270, y2: 630 }
};

if (!reduceMotion) {
animate(".atmosphere-a", { x: [0, 34, -8, 0], y: [0, -16, 8, 0], opacity: [0.36, 0.54, 0.42, 0.36], duration: 22000, loop: true, ease: "inOutSine" });
animate(".atmosphere-b", { x: [0, -42, 16, 0], y: [0, 18, -8, 0], opacity: [0.30, 0.46, 0.34, 0.30], duration: 27000, loop: true, ease: "inOutSine" });
animate(".atmosphere-c", { x: [0, 24, -10, 0], y: [0, -12, 6, 0], opacity: [0.24, 0.38, 0.28, 0.24], duration: 25000, loop: true, ease: "inOutSine" });
animate(".atmosphere-d", { x: [0, -16, 12, 0], y: [0, 10, -5, 0], opacity: [0.18, 0.28, 0.22, 0.18], duration: 19000, loop: true, ease: "inOutSine" });
animate(".base-drift", { opacity: [0.08, 0.16, 0.08], duration: 12000, delay: stagger(900), loop: true, alternate: true, ease: "inOutSine" });

}

function rand(min, max) { return Math.random() * (max - min) + min; }
function choice(items) { return items[Math.floor(Math.random() * items.length)]; }
function make(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}
function isInSafeZone(x, y) {
  const z = CONFIG.centerSafeZone;
  return x > z.x1 && x < z.x2 && y > z.y1 && y < z.y2;
}
function randomPeripheralPoint() {
  for (let i = 0; i < 30; i++) {
    const x = rand(60, 1540);
    const y = rand(60, 840);
    if (!isInSafeZone(x, y)) return { x, y };
  }
  return { x: rand(60, 1540), y: rand(60, 840) };
}
function depthClass() { return choice(["depth-near", "depth-mid", "depth-far"]); }
function cloneForReveal(group) { return group.cloneNode(true); }
function addToBoth(mainGroup, revealGroup) {
  generatedLayer.appendChild(mainGroup);
  revealLayer.appendChild(revealGroup);
}
function fadeOutAndRemove(group, revealClone, life) {
  setTimeout(() => {
    animate(group, { opacity: [1, 0], duration: 650, ease: "outQuad", onComplete: () => group.remove() });
    animate(revealClone, { opacity: [1, 0], duration: 650, ease: "outQuad", onComplete: () => revealClone.remove() });
  }, life);
}
function animateDraw(line, cloneLine, min = 700, max = 1600) {
  const length = line.getTotalLength();
  [line, cloneLine].forEach(item => {
    item.style.strokeDasharray = length;
    item.style.strokeDashoffset = length;
  });
  animate([line, cloneLine], { strokeDashoffset: [length, 0], duration: rand(min, max), ease: "inOutQuad" });
}

function createGuideLine() {
  const { x, y } = randomPeripheralPoint();
  const length = rand(90, 380);
  const angle = rand(-42, 42) * Math.PI / 180;
  const x2 = x + Math.cos(angle) * length;
  const y2 = y + Math.sin(angle) * length;
  const g = make("g", { class: depthClass(), opacity: "0" });
  const line = make("line", { x1: x, y1: y, x2, y2, class: "technical-light draw-path" });
  g.appendChild(line);
  const clone = cloneForReveal(g);
  addToBoth(g, clone);
  animate([g, clone], { opacity: [0, rand(0.6, 1)], duration: rand(300, 650), ease: "outQuad" });
  animateDraw(line, clone.querySelector("line"));
  fadeOutAndRemove(g, clone, rand(CONFIG.lifeMin, CONFIG.lifeMax));
}

function createDimension() {
  const { x, y } = randomPeripheralPoint();
  const horizontal = Math.random() > 0.5;
  const len = rand(90, 250);
  const value = choice(["2.40", "3.00", "3.60", "4.20", "6.00", "7.20", "8.40", "12.00"]);
  const g = make("g", { class: depthClass(), opacity: "0" });
  let line;
  let text;
  if (horizontal) {
    line = make("line", { x1: x, y1: y, x2: x + len, y2: y, class: "technical-line draw-path", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)" });
    text = make("text", { x: x + len / 2, y: y - 11, "text-anchor": "middle", class: "technical-number" });
  } else {
    line = make("line", { x1: x, y1: y, x2: x, y2: y + len, class: "technical-line draw-path", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)" });
    text = make("text", { x: x + 13, y: y + len / 2, class: "technical-number" });
  }
  text.textContent = value;
  g.append(line, text);
  const clone = cloneForReveal(g);
  addToBoth(g, clone);
  animate([g, clone], { opacity: [0, rand(0.65, 1)], duration: rand(350, 700), ease: "outQuad" });
  animateDraw(line, clone.querySelector("line"), 700, 1500);
  fadeOutAndRemove(g, clone, rand(CONFIG.lifeMin, CONFIG.lifeMax));
}

function createArc() {
  const { x, y } = randomPeripheralPoint();
  const r = rand(70, 230);
  const x2 = x + rand(80, 260);
  const y2 = y + rand(-150, 150);
  const g = make("g", { class: depthClass(), opacity: "0" });
  const path = make("path", { d: `M${x} ${y} A${r} ${r} 0 0 ${choice([0,1])} ${x2} ${y2}`, class: "technical-dashed draw-path" });
  g.appendChild(path);
  const clone = cloneForReveal(g);
  addToBoth(g, clone);
  animate([g, clone], { opacity: [0, rand(0.5, 0.9)], duration: rand(350, 700), ease: "outQuad" });
  animateDraw(path, clone.querySelector("path"), 900, 1800);
  fadeOutAndRemove(g, clone, rand(CONFIG.lifeMin, CONFIG.lifeMax));
}

function createCross() {
  const { x, y } = randomPeripheralPoint();
  const size = rand(5, 14);
  const g = make("g", { class: depthClass(), transform: `translate(${x} ${y})`, opacity: "0" });
  g.append(
    make("line", { x1: -size, y1: 0, x2: size, y2: 0, class: "cross" }),
    make("line", { x1: 0, y1: -size, x2: 0, y2: size, class: "cross" })
  );
  const clone = cloneForReveal(g);
  addToBoth(g, clone);
  animate([g, clone], { opacity: [0, rand(0.55,1), rand(0.35,0.65), rand(0.55,1)], duration: rand(700,1400), ease: "inOutSine" });
  fadeOutAndRemove(g, clone, rand(CONFIG.lifeMin, CONFIG.lifeMax));
}

function createCallout() {
  const { x, y } = randomPeripheralPoint();
  const side = x < 800 ? 1 : -1;
  const lineLen = rand(80, 220);
  const rise = rand(-90, 90);
  const tx = x + side * lineLen;
  const ty = y + rise;
  const label = choice(["EJE ESTRUCTURAL", "NIVEL DE REFERENCIA", "ALINEACIÓN", "COORD. MODELO", "SECCIÓN", "TRAZO AUXILIAR", "REFERENCIA", "CONTROL"]);
  const g = make("g", { class: depthClass(), opacity: "0" });
  const node = make("circle", { cx: x, cy: y, r: rand(1.8,2.8), class: "node" });
  const line = make("line", { x1: x, y1: y, x2: tx, y2: ty, class: "technical-line draw-path" });
  const text = make("text", { x: tx + (side > 0 ? 9 : -9), y: ty - 6, class: "technical-text", "text-anchor": side > 0 ? "start" : "end" });
  text.textContent = label;
  g.append(node, line, text);
  const clone = cloneForReveal(g);
  addToBoth(g, clone);
  animate([g, clone], { opacity: [0, rand(0.55,0.95)], duration: rand(350,700), ease: "outQuad" });
  animateDraw(line, clone.querySelector("line"), 700, 1400);
  fadeOutAndRemove(g, clone, rand(CONFIG.lifeMin, CONFIG.lifeMax));
}

function createFragment() {
  const { x, y } = randomPeripheralPoint();
  const w = rand(50,160);
  const h = rand(35,110);
  const g = make("g", { class: depthClass(), transform: `translate(${x} ${y})`, opacity: "0" });
  g.append(
    make("rect", { x: 0, y: 0, width: w, height: h, class: "technical-light" }),
    make("line", { x1: w * rand(0.25,0.70), y1: 0, x2: w * rand(0.25,0.70), y2: h, class: "technical-dashed" }),
    make("line", { x1: 0, y1: h * rand(0.25,0.70), x2: w, y2: h * rand(0.25,0.70), class: "technical-light" })
  );
  const clone = cloneForReveal(g);
  addToBoth(g, clone);
  animate([g, clone], { opacity: [0, rand(0.4,0.75)], duration: rand(400,850), ease: "outQuad" });
  fadeOutAndRemove(g, clone, rand(CONFIG.lifeMin, CONFIG.lifeMax));
}

const generators = [
  createGuideLine, createGuideLine, createGuideLine,
  createDimension, createDimension,
  createArc, createArc,
  createCross, createCross,
  createCallout, createCallout,
  createFragment
];

function activeCount() { return generatedLayer.children.length; }
function spawn() {
  if (!document.hidden && activeCount() < CONFIG.maxActive) {
    choice(generators)();
    if (Math.random() > 0.58 && activeCount() < CONFIG.maxActive) {
      setTimeout(() => { if (!document.hidden && activeCount() < CONFIG.maxActive) choice(generators)(); }, rand(60,180));
    }
  }
  setTimeout(spawn, rand(CONFIG.spawnMin, CONFIG.spawnMax));
}
if (!reduceMotion) {
for (let i = 0; i < 8; i++) setTimeout(() => choice(generators)(), i * 220);
setTimeout(spawn, 600);
}

let mouseX = 800, mouseY = 450, currentX = 800, currentY = 450;
let targetRadius = 0, currentRadius = 0;
let parallaxX = 0, parallaxY = 0, targetParallaxX = 0, targetParallaxY = 0;

function pointerToSVG(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  return matrix ? point.matrixTransform(matrix.inverse()) : point;
}

window.addEventListener("pointermove", event => {
  const p = pointerToSVG(event);
  mouseX = p.x;
  mouseY = p.y;
  targetRadius = CONFIG.revealRadius;
  targetParallaxX = (event.clientX / window.innerWidth - 0.5) * 8;
  targetParallaxY = (event.clientY / window.innerHeight - 0.5) * 6;
});

document.documentElement.addEventListener("pointerleave", () => {
  targetRadius = 0;
  targetParallaxX = 0;
  targetParallaxY = 0;
});

let frameId = null;
function updateFrame() {
  frameId = null;
  if (document.hidden || reduceMotion) return;
  currentX += (mouseX - currentX) * 0.075;
  currentY += (mouseY - currentY) * 0.075;
  currentRadius += (targetRadius - currentRadius) * 0.055;
  parallaxX += (targetParallaxX - parallaxX) * 0.035;
  parallaxY += (targetParallaxY - parallaxY) * 0.035;
  revealCircle.setAttribute("cx", currentX);
  revealCircle.setAttribute("cy", currentY);
  revealCircle.setAttribute("r", currentRadius);
  generatedLayer.setAttribute("transform", `translate(${parallaxX * 0.55} ${parallaxY * 0.55})`);
  revealLayer.setAttribute("transform", `translate(${parallaxX} ${parallaxY})`);
  frameId = requestAnimationFrame(updateFrame);
}
updateFrame();
document.addEventListener('visibilitychange', () => {
  if(document.hidden){cancelAnimationFrame(frameId);frameId=null;}
  else if(frameId === null)updateFrame();
});
