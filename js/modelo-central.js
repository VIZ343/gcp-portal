import * as THREE from '../assets/vendor/three.module.js';

const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const statusEl = document.querySelector('#status');
const scrollHint = document.querySelector('#scrollHint');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const compactDevice = window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
const pixelRatioLimit = compactDevice ? 1.5 : 2;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioLimit));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xffffff, 0);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.01, 50);
camera.position.set(0, 0.08, 10.3);

const root = new THREE.Group();
scene.add(root);
const baseTarget = new THREE.Vector3(0, 0, 0);
const clock = new THREE.Clock();

const STATES = [
  { name: 'ESFERA' },
  { name: '00_E_2', url: './assets/modelo-central/00_E_2.png' },
  { name: '01_E_2', url: './assets/modelo-central/01_E_2.png' },
  { name: 'ARQ_E', url: './assets/modelo-central/Arq_E.png' }
];

// MODELO CENTRAL — configuración estable de Home.
const INSTANCE_COUNT = compactDevice ? 24000 : 52000;
const SPHERE_DETAIL = 1;
const BASE_RADIUS = 0.015;

const TARGET_BOX_W = 8.25;
const TARGET_BOX_H = 5.35;
const TRANSITION_MS = reduceMotion ? 0 : 3400;
const WHEEL_THRESHOLD = 48;

let particles = null;
let particleMaterial = null;
let currentStage = 0;
let transitionBusy = false;
let wheelAccumulator = 0;
let touchStartY = null;
let pointerInside = false;
let pointerX = 0, pointerY = 0, pointerTX = 0, pointerTY = 0;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function clamp01(v) { return clamp(v, 0, 1); }
function easeInOutCubic(t) { t = clamp01(t); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
function tween({duration, update}) {
  return new Promise(resolve => {
    if (duration === 0) { update(1); resolve(); return; }
    const start = performance.now();
    function frame(now) {
      const t = clamp01((now-start)/duration);
      update(t);
      if (t < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => reject(new Error(`Tiempo de carga agotado: ${url}`)), 15000);
    img.onload = () => { clearTimeout(timeout); resolve(img); };
    img.onerror = () => { clearTimeout(timeout); reject(new Error(`No se pudo cargar: ${url}`)); };
    img.src = url;
  });
}
function imagePixels(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  ctx.drawImage(img,0,0);
  return { width:canvas.width, height:canvas.height, data:ctx.getImageData(0,0,canvas.width,canvas.height).data };
}
function isVisiblePixel(data,i) { return data[i+3] > 42; }
function scanVisiblePixels(source) {
  const {width,height,data}=source;
  let minX=width,minY=height,maxX=0,maxY=0,count=0;
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=(y*width+x)*4;
    if(!isVisiblePixel(data,i)) continue;
    count++;
    if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
  }
  if(!count) throw new Error('La imagen no contiene píxeles visibles.');
  return {minX,minY,maxX,maxY,count};
}
function hash01(x,y,seed=0) {
  let h=Math.imul(x+1+seed*17,73856093)^Math.imul(y+1+seed*29,19349663);
  h=h>>>0;
  return (h%1000000)/1000000;
}
function edgeScore(data,width,height,x,y) {
  const i=(y*width+x)*4;
  let d=0;
  if(x+1<width) {
    const j=(y*width+x+1)*4;
    d+=Math.abs(data[i]-data[j])+Math.abs(data[i+1]-data[j+1])+Math.abs(data[i+2]-data[j+2])+Math.abs(data[i+3]-data[j+3]);
  }
  if(y+1<height) {
    const j=((y+1)*width+x)*4;
    d+=Math.abs(data[i]-data[j])+Math.abs(data[i+1]-data[j+1])+Math.abs(data[i+2]-data[j+2])+Math.abs(data[i+3]-data[j+3]);
  }
  return clamp01(d/220);
}
function depthFromNormalized(nx,ny,stateIndex,luminance) {
  let depth=0.02;
  depth+=(1-Math.abs(nx))*0.11;
  depth+=(1-Math.abs(ny))*0.07;
  depth+=Math.sin((nx+1)*2.7+stateIndex*0.8)*0.035;
  depth+=Math.cos((ny+1)*3.1+stateIndex*0.5)*0.025;
  depth+=(1-luminance)*0.055;
  return depth;
}
function buildTargetFromImage(img,stateIndex) {
  const source=imagePixels(img);
  const bbox=scanVisiblePixels(source);
  const {width,height,data}=source;
  const bboxW=Math.max(1,bbox.maxX-bbox.minX+1);
  const bboxH=Math.max(1,bbox.maxY-bbox.minY+1);
  const modelScale=Math.min(TARGET_BOX_W/bboxW,TARGET_BOX_H/bboxH);
  const cx=(bbox.minX+bbox.maxX)*0.5;
  const cy=(bbox.minY+bbox.maxY)*0.5;
  const desiredCandidates=INSTANCE_COUNT*2.2;
  const baseProbability=Math.min(1,desiredCandidates/bbox.count);
  const points=[]; const colors=[];
  for(let y=bbox.minY;y<=bbox.maxY;y++) for(let x=bbox.minX;x<=bbox.maxX;x++) {
    const i=(y*width+x)*4;
    if(!isVisiblePixel(data,i)) continue;
    const edge=edgeScore(data,width,height,x,y);
    const probability=Math.min(1,baseProbability*(0.42+edge*2.7));
    if(hash01(x,y,stateIndex)>probability) continue;
    const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;
    const luminance=r*0.2126+g*0.7152+b*0.0722;
    const px=(x-cx)*modelScale;
    const py=-(y-cy)*modelScale;
    const nx=(x-cx)/(bboxW*0.5);
    const ny=-(y-cy)/(bboxH*0.5);
    const pz=-0.18+depthFromNormalized(nx,ny,stateIndex,luminance);
    points.push(px,py,pz); colors.push(r,g,b);
  }
  const sourceCount=points.length/3;
  if(!sourceCount) throw new Error(`No se pudo generar ${STATES[stateIndex].name}`);
  const target=new Float32Array(INSTANCE_COUNT*3);
  const targetColor=new Float32Array(INSTANCE_COUNT*3);
  for(let i=0;i<INSTANCE_COUNT;i++) {
    const src=Math.min(sourceCount-1,Math.floor(((i+0.5)/INSTANCE_COUNT)*sourceCount));
    const s=src*3,d=i*3;
    target[d]=points[s]; target[d+1]=points[s+1]; target[d+2]=points[s+2];
    targetColor[d]=colors[s]; targetColor[d+1]=colors[s+1]; targetColor[d+2]=colors[s+2];
  }
  return {target,color:targetColor,sourceCount};
}
function buildSpherePositions(count) {
  const result=new Float32Array(count*3);
  const radius=2.0;
  for(let i=0;i<count;i++) {
    const k=i*3;
    const y=1-2*(i+0.5)/count;
    const r=Math.sqrt(Math.max(0,1-y*y));
    const theta=i*Math.PI*(3-Math.sqrt(5));
    const shell=0.80+Math.random()*0.28;
    result[k]=Math.cos(theta)*r*radius*shell;
    result[k+1]=y*radius*shell;
    result[k+2]=Math.sin(theta)*r*radius*shell;
  }
  return result;
}
function buildScales(count) {
  const scale=new Float32Array(count);
  const random=new Float32Array(count);
  for(let i=0;i<count;i++) {
    random[i]=Math.random();
    const r=Math.random();
    if(r<0.70) scale[i]=THREE.MathUtils.lerp(0.62,1.00,Math.random());
    else if(r<0.95) scale[i]=THREE.MathUtils.lerp(1.05,1.55,Math.random());
    else scale[i]=THREE.MathUtils.lerp(1.65,2.45,Math.random());
  }
  return {scale,random};
}

function createParticles(targets) {
  const sphere=buildSpherePositions(INSTANCE_COUNT);
  const {scale,random}=buildScales(INSTANCE_COUNT);
  const geometry=new THREE.IcosahedronGeometry(1,SPHERE_DETAIL);
  geometry.setAttribute('iSphere',new THREE.InstancedBufferAttribute(sphere,3));
  geometry.setAttribute('iTarget0',new THREE.InstancedBufferAttribute(targets[0].target,3));
  geometry.setAttribute('iTarget1',new THREE.InstancedBufferAttribute(targets[1].target,3));
  geometry.setAttribute('iTarget2',new THREE.InstancedBufferAttribute(targets[2].target,3));
  geometry.setAttribute('iColor0',new THREE.InstancedBufferAttribute(targets[0].color,3));
  geometry.setAttribute('iColor1',new THREE.InstancedBufferAttribute(targets[1].color,3));
  geometry.setAttribute('iColor2',new THREE.InstancedBufferAttribute(targets[2].color,3));
  geometry.setAttribute('iRandom',new THREE.InstancedBufferAttribute(random,1));
  geometry.setAttribute('iScale',new THREE.InstancedBufferAttribute(scale,1));

  particleMaterial=new THREE.ShaderMaterial({
    uniforms:{
      uStage:{value:0},uTime:{value:0},
      uPointer:{value:new THREE.Vector2(10,10)},uPointerStrength:{value:0},
      uBaseRadius:{value:BASE_RADIUS}
    },
    vertexShader:`
      attribute vec3 iSphere;
      attribute vec3 iTarget0; attribute vec3 iTarget1; attribute vec3 iTarget2;
      attribute vec3 iColor0; attribute vec3 iColor1; attribute vec3 iColor2;
      attribute float iRandom; attribute float iScale;
      uniform float uStage; uniform float uTime; uniform vec2 uPointer; uniform float uPointerStrength; uniform float uBaseRadius;
      varying vec3 vColor; varying vec3 vNormal; varying vec3 vViewPosition; varying float vSphereMix; varying float vInfluence;
      float ease(float x){x=clamp(x,0.0,1.0);return x<0.5?4.0*x*x*x:1.0-pow(-2.0*x+2.0,3.0)/2.0;}
      vec3 hue2rgb(float h){vec3 rgb=clamp(abs(mod(h*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);return rgb*rgb*(3.0-2.0*rgb);}
      vec3 hsl2rgb(vec3 hsl){vec3 rgb=hue2rgb(hsl.x);float c=(1.0-abs(2.0*hsl.z-1.0))*hsl.y;return (rgb-0.5)*c+hsl.z;}
      void main(){
        vec3 center; vec3 color; float localT;
        float sphereMix=1.0-smoothstep(0.0,1.0,uStage);
        float hue=fract(0.54+iRandom*0.34+iSphere.y*0.06+sin(uTime*0.12+iRandom*16.0)*0.045);
        vec3 sphereColor=hsl2rgb(vec3(hue,0.76,0.62));
        if(uStage<1.0){localT=ease(uStage);center=mix(iSphere,iTarget0,localT);color=mix(sphereColor,iColor0,localT);}
        else if(uStage<2.0){localT=ease(uStage-1.0);center=mix(iTarget0,iTarget1,localT);color=mix(iColor0,iColor1,localT);}
        else{localT=ease(uStage-2.0);center=mix(iTarget1,iTarget2,localT);color=mix(iColor1,iColor2,localT);}
        float formed=smoothstep(0.08,0.75,min(uStage,1.0));
        vec3 radial=normalize(iSphere+vec3(0.001));
        float sphereWave=sin(iSphere.x*2.8+iSphere.y*1.7+uTime*1.55+iRandom*13.0)*0.055+cos(iSphere.z*3.1-iSphere.y*2.0-uTime*1.15+iRandom*9.0)*0.038;
        center+=radial*sphereWave*sphereMix;
        float architecturalWave=sin(center.x*1.8+uTime*0.75+iRandom*8.0)*cos(center.y*1.45-uTime*0.65+iRandom*6.0);
        center.y+=architecturalWave*0.010*formed; center.z+=architecturalWave*0.014*formed;
        vec3 suspension=vec3(sin(uTime*(0.28+iRandom*0.20)+iRandom*29.0),cos(uTime*(0.36+iRandom*0.21)+iRandom*41.0),sin(uTime*(0.26+iRandom*0.16)+iRandom*53.0));
        center+=suspension*(0.006+iRandom*0.012)*formed;
        float bloom=sin(fract(uStage)*3.14159265);
        center+=normalize(center+vec3(0.001))*bloom*(0.035+iRandom*0.055);
        vec4 centerView=modelViewMatrix*vec4(center,1.0); vec4 centerClip=projectionMatrix*centerView; vec2 centerNDC=centerClip.xy/max(centerClip.w,0.0001);
        float influence=(1.0-smoothstep(0.0,0.28,distance(centerNDC,uPointer)))*uPointerStrength;
        float angle=atan(centerNDC.y-uPointer.y,centerNDC.x-uPointer.x)+1.5707963;
        center.xy+=vec2(cos(angle),sin(angle))*(0.018+iRandom*0.024)*influence;
        center.z+=sin(uTime*3.5+iRandom*21.0)*0.035*influence;
        float radius=uBaseRadius*iScale*mix(1.18,1.0,formed)*(1.0+influence*0.25);
        vec3 finalPosition=center+position*radius;
        vec4 mvPosition=modelViewMatrix*vec4(finalPosition,1.0); gl_Position=projectionMatrix*mvPosition;
        vNormal=normalize(normalMatrix*normal); vViewPosition=-mvPosition.xyz; vColor=color; vSphereMix=sphereMix; vInfluence=influence;
      }`,
    fragmentShader:`
      varying vec3 vColor; varying vec3 vNormal; varying vec3 vViewPosition; varying float vSphereMix; varying float vInfluence;
      void main(){
        vec3 N=normalize(vNormal); vec3 V=normalize(vViewPosition);
        vec3 L1=normalize(vec3(-0.42,0.68,0.72)); vec3 L2=normalize(vec3(0.72,-0.18,0.55));
        float diffuse=max(dot(N,L1),0.0)*0.70+max(dot(N,L2),0.0)*0.30;
        vec3 H=normalize(L1+V); float specular=pow(max(dot(N,H),0.0),32.0);
        float rim=pow(1.0-max(dot(N,V),0.0),2.2);
        vec3 color=vColor*(0.42+diffuse*0.80);
        color+=vec3(1.0)*specular*0.33;
        color+=vec3(0.62,0.76,1.0)*rim*(0.12+vSphereMix*0.10);
        color+=vec3(0.24,0.42,0.82)*vInfluence*0.22;
        gl_FragColor=vec4(color,1.0);
      }`,
    transparent:false, depthWrite:true, depthTest:true
  });

  particles=new THREE.InstancedMesh(geometry,particleMaterial,INSTANCE_COUNT);
  const identity=new THREE.Matrix4();
  for(let i=0;i<INSTANCE_COUNT;i++) particles.setMatrixAt(i,identity);
  particles.instanceMatrix.needsUpdate=true;
  particles.frustumCulled=false;
  root.add(particles);
}

function fitModelToViewport() {
  const aspect=window.innerWidth/window.innerHeight;
  const verticalFov=THREE.MathUtils.degToRad(camera.fov);
  const visibleHeight=2*Math.tan(verticalFov/2)*camera.position.z;
  const visibleWidth=visibleHeight*aspect;
  const scaleByWidth=visibleWidth/(TARGET_BOX_W*1.18);
  const scaleByHeight=visibleHeight/(TARGET_BOX_H*1.18);
  root.scale.setScalar(Math.min(scaleByWidth,scaleByHeight,1.0) * 0.70);
}
function updateStatus() {
  statusEl.textContent=STATES[currentStage].name;
  if(currentStage===0) scrollHint.textContent='SCROLL ↓';
  else if(currentStage===STATES.length-1) scrollHint.textContent='SCROLL ↑';
  else scrollHint.textContent='SCROLL ↓ / ↑';
}
async function transitionToStage(nextStage) {
  nextStage=clamp(nextStage,0,STATES.length-1);
  if(transitionBusy||nextStage===currentStage||!particleMaterial)return;
  transitionBusy=true;
  const from=particleMaterial.uniforms.uStage.value, to=nextStage;
  statusEl.textContent=`${STATES[currentStage].name} → ${STATES[nextStage].name}`;
  await tween({duration:TRANSITION_MS,update:raw=>{particleMaterial.uniforms.uStage.value=THREE.MathUtils.lerp(from,to,easeInOutCubic(raw));}});
  particleMaterial.uniforms.uStage.value=to;
  currentStage=nextStage;
  transitionBusy=false;
  updateStatus();
  if(reduceMotion)render();
}
function requestStep(direction){if(!transitionBusy)transitionToStage(currentStage+direction);}

window.addEventListener('wheel',event=>{
  if(event.ctrlKey || event.metaKey)return;
  event.preventDefault();
  if(transitionBusy)return;
  wheelAccumulator+=event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
  if(Math.abs(wheelAccumulator)>=WHEEL_THRESHOLD){requestStep(wheelAccumulator>0?1:-1);wheelAccumulator=0;}
},{passive:false});
window.addEventListener('keydown',event=>{
  if(event.target.closest('input, textarea, select, [contenteditable]'))return;
  if(event.key==='ArrowDown'||event.key==='PageDown'){event.preventDefault();requestStep(1);}
  if(event.key==='ArrowUp'||event.key==='PageUp'){event.preventDefault();requestStep(-1);}
});
window.addEventListener('touchstart',event=>{touchStartY=event.touches[0]?.clientY??null;},{passive:true});
window.addEventListener('touchend',event=>{
  if(touchStartY==null)return;
  const endY=event.changedTouches[0]?.clientY??touchStartY;
  const delta=touchStartY-endY; touchStartY=null;
  if(Math.abs(delta)>42)requestStep(delta>0?1:-1);
},{passive:true});
window.addEventListener('pointermove',event=>{
  pointerInside=true;
  pointerTX=(event.clientX/window.innerWidth-0.5)*2;
  pointerTY=(event.clientY/window.innerHeight-0.5)*2;
});
document.documentElement.addEventListener('pointerleave',()=>{pointerInside=false;pointerTX=0;pointerTY=0;});
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,pixelRatioLimit));
  renderer.setSize(window.innerWidth,window.innerHeight);
  fitModelToViewport();
  if(reduceMotion)render();
});

async function init() {
  const images=await Promise.all(STATES.slice(1).map(state=>loadImage(state.url)));
  loading.querySelector('span').textContent=`GENERANDO ${INSTANCE_COUNT / 1000}K MICRO-ESFERAS`;
  const targets=images.map((img,index)=>buildTargetFromImage(img,index+1));
  createParticles(targets);
  fitModelToViewport();
  console.info('[ELEMENTO CENTRAL DE PORTADA]',{instances:INSTANCE_COUNT,detail:SPHERE_DETAIL,baseRadius:BASE_RADIUS,targets:targets.map((t,i)=>({state:STATES[i+1].name,sourceSamples:t.sourceCount}))});
  loading.classList.add('is-hidden');
  updateStatus();
  window.dispatchEvent(new CustomEvent('gcp:central-ready'));
}

let frameId = null;
let contextLost = false;
function render() {
  frameId = null;
  if(document.hidden || contextLost)return;
  if(!reduceMotion)frameId = requestAnimationFrame(render);
  const time=reduceMotion ? 0 : clock.getElapsedTime();
  pointerX+=(pointerTX-pointerX)*0.05;
  pointerY+=(pointerTY-pointerY)*0.05;
  if(particleMaterial) {
    particleMaterial.uniforms.uTime.value=time;
    particleMaterial.uniforms.uPointer.value.set(pointerX,-pointerY);
    const target=pointerInside?1:0;
    particleMaterial.uniforms.uPointerStrength.value+=(target-particleMaterial.uniforms.uPointerStrength.value)*0.08;
    const stageValue=particleMaterial.uniforms.uStage.value;
    const formed=clamp01(stageValue/0.85);
    const formedWeight=formed*formed*(3-2*formed);
    root.rotation.y=pointerX*0.055*formedWeight;
    root.rotation.x=-pointerY*0.028*formedWeight;
    // Mantener el modelo centrado; el cursor conserva solo una rotacion sutil.
    root.position.x=0;
    root.position.y=0;
    if(stageValue<0.08){root.rotation.y=time*0.095;root.rotation.x=Math.sin(time*0.21)*0.045;}
  }
  camera.lookAt(baseTarget);
  renderer.render(scene,camera);
}

function resumeRender() {
  if(frameId === null && !document.hidden && !contextLost)render();
}
document.addEventListener('visibilitychange', () => {
  if(document.hidden){cancelAnimationFrame(frameId);frameId=null;}else resumeRender();
});
renderer.domElement.addEventListener('webglcontextlost', event => {
  event.preventDefault(); contextLost=true; cancelAnimationFrame(frameId);frameId=null;
  statusEl.textContent='VISUALIZACIÓN PAUSADA';
});
renderer.domElement.addEventListener('webglcontextrestored', () => {contextLost=false;updateStatus();resumeRender();});

export async function initializeCentral() {
  await init();
  resumeRender();
}
