/**
 * Background local GCP Portal V0.2 (basado en el modulo verificado del repositorio).
 * Mayor cantidad, frecuencia y opacidad, manteniendo el lenguaje original.
 * Este módulo no requiere red ni librerías adicionales.
 */
const host = document.querySelector('[data-gcp-background]');
if (host) {
  host.innerHTML = `
  <div class="atmosphere atmosphere-a"></div><div class="atmosphere atmosphere-b"></div>
  <div class="atmosphere atmosphere-c"></div><div class="atmosphere atmosphere-d"></div>
  <svg id="technical-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="revealGradient"><stop offset="0%" stop-color="white" stop-opacity="1"/><stop offset="46%" stop-color="white" stop-opacity=".92"/><stop offset="78%" stop-color="white" stop-opacity=".28"/><stop offset="100%" stop-color="black" stop-opacity="0"/></radialGradient>
      <mask id="cursorMask" maskUnits="userSpaceOnUse"><rect width="1600" height="900" fill="black"/><circle id="revealCircle" cx="800" cy="450" r="0" fill="url(#revealGradient)"/></mask>
      <marker id="arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#5a7185" opacity=".26"/></marker>
      <g id="baseTechnical">
        <path d="M120 690 C330 610 530 580 720 610" class="technical-light base-drift"/>
        <path d="M980 260 C1190 235 1370 275 1490 355" class="technical-light base-drift"/>
        <path d="M245 190 A310 310 0 0 1 545 430" class="technical-dashed base-drift"/>
        <line x1="1160" y1="690" x2="1470" y2="690" class="axis base-drift"/>
        <line x1="330" y1="120" x2="330" y2="335" class="technical-light base-drift"/>
        <g transform="translate(235 235)"><path d="M-10 0H10 M0 -10V10" class="cross"/></g>
        <g transform="translate(1325 620)"><path d="M-10 0H10 M0 -10V10" class="cross"/></g>
      </g>
    </defs>
    <g id="base-layer"><use href="#baseTechnical"/></g>
    <g id="generated-layer"></g>
    <g id="reveal-layer" mask="url(#cursorMask)"></g>
  </svg>`;
  const svg=host.querySelector('#technical-svg');
  const generated=host.querySelector('#generated-layer');
  const reveal=host.querySelector('#reveal-layer');
  const circle=host.querySelector('#revealCircle');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS='http://www.w3.org/2000/svg';
  const create=(tag,attrs={})=>{const node=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);return node;};
  const rand=(a,b)=>a+Math.random()*(b-a);
  const pick=arr=>arr[Math.floor(rand(0,arr.length))];
  const centerSafe={x1:630,x2:970,y1:340,y2:590};
  let mx=800,my=450,cx=800,cy=450,targetRadius=0,radius=0,px=0,py=0,tpx=0,tpy=0;
  const point=()=>{
    for(let i=0;i<30;i++){const x=rand(60,1540),y=rand(60,840);if(x<=centerSafe.x1||x>=centerSafe.x2||y<=centerSafe.y1||y>=centerSafe.y2)return{x,y};}
    return{x:rand(60,1540),y:rand(60,840)};
  };
  function shape(){
    const {x,y}=point();const group=create('g',{class:pick(['depth-near','depth-mid','depth-far'])});
    const kind=pick(['line','line','dimension','dimension','arc','cross','annotation','annotation','fragment']);
    if(kind==='line'){
      const length=rand(100,370),a=rand(-.65,.65);
      group.append(create('line',{x1:x,y1:y,x2:x+Math.cos(a)*length,y2:y+Math.sin(a)*length,class:'technical-light draw-path'}));
    }else if(kind==='dimension'){
      const n=rand(90,250),line=create('line',{x1:x,y1:y,x2:x+n,y2:y,class:'technical-line draw-path','marker-start':'url(#arrow)','marker-end':'url(#arrow)'});
      const t=create('text',{x:x+n/2,y:y-11,'text-anchor':'middle',class:'technical-number'});
      t.textContent=pick(['2.40','3.00','3.60','4.20','6.00','7.20','8.40']);group.append(line,t);
    }else if(kind==='arc'){
      group.append(create('path',{d:`M${x} ${y} A${rand(70,230)} ${rand(70,230)} 0 0 1 ${x+rand(80,210)} ${y+rand(-100,100)}`,class:'technical-dashed draw-path'}));
    }else if(kind==='cross'){
      const z=rand(5,14);group.append(create('path',{d:`M${x-z} ${y}H${x+z} M${x} ${y-z}V${y+z}`,class:'cross'}));
    }else if(kind==='annotation'){
      const sign=x<800?1:-1,ex=x+sign*rand(80,190),ey=y+rand(-80,80);
      const t=create('text',{x:ex+sign*7,y:ey-7,'text-anchor':sign>0?'start':'end',class:'technical-text'});t.textContent=pick(['REFERENCIA','EJE ESTRUCTURAL','SECCIÓN','COORD. MODELO','ALINEACIÓN']);
      group.append(create('circle',{cx:x,cy:y,r:2,class:'node'}),create('line',{x1:x,y1:y,x2:ex,y2:ey,class:'technical-line draw-path'}),t);
    }else{
      group.append(create('rect',{x,y,width:rand(50,130),height:rand(35,90),class:'technical-light'}));
    }
    const twin=group.cloneNode(true);generated.append(group);reveal.append(twin);
    for(const el of [group,twin]){el.style.opacity='0';el.animate([{opacity:0},{opacity:1},{opacity:1},{opacity:0}],{duration:rand(5400,8300),easing:'ease-in-out'}).onfinish=()=>el.remove();}
  }
  let timer=null,raf=null;
  function spawn(){
    if(!document.hidden && generated.childElementCount<41)shape();
    timer=window.setTimeout(spawn,rand(95,225));
  }
  function frame(t){
    if(document.hidden)return;
    cx+=(mx-cx)*.075;cy+=(my-cy)*.075;radius+=(targetRadius-radius)*.055;
    px+=(tpx-px)*.035;py+=(tpy-py)*.035;
    circle.setAttribute('cx',cx);circle.setAttribute('cy',cy);circle.setAttribute('r',radius);
    generated.setAttribute('transform',`translate(${px*.55} ${py*.55})`);
    reveal.setAttribute('transform',`translate(${px} ${py})`);
    const atm=host.querySelectorAll('.atmosphere');
    atm.forEach((el,i)=>{el.style.transform=`translate3d(${Math.sin(t*.00014+i)*[34,42,24,16][i]}px,${Math.sin(t*.00019+i)*[16,18,12,10][i]}px,0)`;});
    raf=requestAnimationFrame(frame);
  }
  function onPointer(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const matrix=svg.getScreenCTM();const v=matrix?p.matrixTransform(matrix.inverse()):p;
    mx=v.x;my=v.y;targetRadius=275;tpx=(e.clientX/window.innerWidth-.5)*8;tpy=(e.clientY/window.innerHeight-.5)*6;
  }
  window.addEventListener('pointermove',onPointer,{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{targetRadius=0;tpx=0;tpy=0;});
  if(!reduce){for(let i=0;i<22;i++)setTimeout(shape,103*i);spawn();raf=requestAnimationFrame(frame);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);clearTimeout(timer);}else if(!reduce){raf=requestAnimationFrame(frame);spawn();}});
}
