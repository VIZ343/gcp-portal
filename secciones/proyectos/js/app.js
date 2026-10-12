import { projects, getProjects } from './projects.js';

const grid = document.querySelector('#gallery-grid');
const scroller = document.querySelector('#gallery-scroll');
const count = document.querySelector('#project-count');
const progress = document.querySelector('#gallery-progress');
const tabs = [...document.querySelectorAll('.section-tab')];
const dialog = document.querySelector('#project-dialog');
const dialogBody = document.querySelector('#dialog-body');
const dialogClose = document.querySelector('#detail-close');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sectionState = { active: 'industrial', cards: [], changing: false };
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let videoObserver=null;

// Permite cambiar una portada de imagen a clip sin tocar la estructura espacial.
function createMedia(project, eager=false) {
  const wrapper=document.createElement('div');
  wrapper.className='book-media';
  wrapper.style.setProperty('--media-position', project.media.position || 'center');
  if(project.media.type==='video' && project.media.src){
    const v=document.createElement('video');
    v.src=project.media.src;
    v.muted=true;v.loop=true;v.playsInline=true;
    v.preload='metadata';
    if(project.media.poster)v.poster=project.media.poster;
    wrapper.append(v);
  } else {
    const img=document.createElement('img');
    img.alt=`Fotografía de referencia: ${project.name}`;
    img.loading=eager?'eager':'lazy';
    img.decoding='async';
    img.fetchPriority=eager?'high':'auto';
    // Mostrar inmediatamente el respaldo; sustituirlo sólo cuando la foto oficial haya cargado.
    // Evita recuadros vacíos por URLs Wix lentas o sin conexión.
    img.src=project.media.fallback;
    wrapper.classList.add('is-preview');
    if(project.media.src){
      const official=new Image();
      official.decoding='async';
      official.onload=()=>{if(img.isConnected){img.src=project.media.src;wrapper.classList.remove('is-preview');}};
      official.src=project.media.src;
    }
    wrapper.append(img);
    const label=document.createElement('span');
    label.className='media-preview-flag';
    label.textContent='IMAGEN DE MAQUETA';
    wrapper.append(label);
  }
  const icon=document.createElement('span');
  icon.className='book-open-icon'; icon.setAttribute('aria-hidden','true');icon.textContent='↗';
  wrapper.append(icon);
  return wrapper;
}

function makeCard(project,index,total){
  // Celda fija y con perspectiva propia: nunca recibe transformaciones.
  const cell=document.createElement('div');
  cell.className='gallery-cell';
  cell.dataset.id=project.id;
  cell.dataset.index=index;
  cell.dataset.state='initial';
  const outer=document.createElement('div');
  outer.className='gallery-item';
  const btn=document.createElement('button');
  btn.className='book-card';
  btn.type='button';
  btn.setAttribute('aria-label',`Ver ${project.name}. ${project.location}. ${project.year}.`);

  const cover=document.createElement('div');cover.className='book-cover';
  const head=document.createElement('div');head.className='book-head';
  const nameClass=project.name.length>25?'is-very-long':project.name.length>14?'is-long':'';
  head.innerHTML=`
    <div class="book-topline">
      <div><span class="book-mini-brand">GCP Portal</span><span class="book-mini-tag">PROYECTOS QUE IMPULSAN TERRITORIOS</span></div>
      <span class="book-index">${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span>
    </div>
    <div class="book-text">
      <span class="book-category">${escapeHtml(project.category)}</span>
      <h2 class="book-title ${nameClass}">${escapeHtml(project.name)}</h2>
      <div class="book-data"><span>${escapeHtml(project.location)}</span><span>${project.year}</span></div>
    </div>`;
  cover.append(head,createMedia(project,index<3));
  for(const cls of ['book-back','book-pages','book-top-edge']){
    const layer=document.createElement('span');
    layer.className=cls;
    layer.setAttribute('aria-hidden','true');
    btn.append(layer);
  }
  btn.append(cover);
  outer.append(btn);
  const caption=document.createElement('div');
  caption.className='gallery-item-caption';
  caption.innerHTML=`<span>VER PROYECTO <span aria-hidden="true">·</span> ${String(index+1).padStart(2,'0')}</span><span>↗</span>`;
  cell.append(outer,caption);
  btn.addEventListener('click',()=>openProject(project));

  // Estado LOCAL. Solo la celda de este proyecto recibe la clase de activacion.
  const activate=()=>{cell.dataset.state='hover';};
  const deactivate=()=>{cell.dataset.state='initial';};
  cell.addEventListener('pointerenter',activate);
  cell.addEventListener('pointerleave',()=>{
    if(!cell.contains(document.activeElement))deactivate();
  });
  cell.addEventListener('focusin',activate);
  cell.addEventListener('focusout',e=>{
    if(!cell.contains(e.relatedTarget) && !cell.matches(':hover'))deactivate();
  });
  return {node:cell,item:outer,card:btn,project,index};
}

function renderSection(section){
  const data=getProjects(section);
  for(const v of grid.querySelectorAll('video'))v.pause();
  videoObserver?.disconnect();
  grid.replaceChildren();sectionState.cards=[];
  sectionState.active=section;
  count.textContent=String(data.length).padStart(2,'0');
  tabs.forEach(tab=>{
    const chosen=tab.dataset.section===section;
    tab.classList.toggle('is-active',chosen);
    tab.setAttribute('aria-pressed',String(chosen));
  });
  data.forEach((project,index)=>{
    const state=makeCard(project,index,data.length);
    state.node.style.opacity='0';
    grid.append(state.node);
    sectionState.cards.push(state);
  });
  // Observacion: nunca reproducir video fuera del viewport.
  videoObserver = new IntersectionObserver(entries=>{
    for(const e of entries){
      const v=e.target.querySelector('video');
      if(!v)continue;
      if(!e.isIntersecting)v.pause();
      else if(e.target.matches(':hover')&&!reducedMotion.matches)v.play().catch(()=>{});
    }
  },{root:scroller,threshold:.3});
  sectionState.cards.forEach(s=>{
    videoObserver.observe(s.node);
    s.node.addEventListener('pointerenter',()=>{
      const v=s.node.querySelector('video');
      if(v&&!reducedMotion.matches)v.play().catch(()=>{});
    });
    s.node.addEventListener('pointerleave',()=>s.node.querySelector('video')?.pause());
  });
  scroller.scrollTop=0;
  progress.textContent=`01 — ${String(Math.ceil(data.length/3)).padStart(2,'0')}`;
  requestAnimationFrame(()=>{
    fitCoverTitles();
    sectionState.cards.forEach((state,i)=>{
      state.node.style.transition=`opacity 560ms cubic-bezier(.22,1,.36,1) ${Math.min(i,7)*68}ms`;
      state.node.style.opacity='1';
    });
  });
}

function switchSection(section){
  if(sectionState.changing||section===sectionState.active)return;
  sectionState.changing=true;
  grid.classList.add('is-changing');
  window.setTimeout(()=>{
    renderSection(section);
    grid.classList.remove('is-changing');
    sectionState.changing=false;
  },reducedMotion.matches?0:240);
}

function openProject(project){
  if(dialog.open)return;
  const safeName=escapeHtml(project.name);
  const projectHref=escapeHtml(project.projectUrl || 'https://www.gcpeasa.mx/portafolio');
  const bimLink=project.bimUrl
    ? `<a class="dialog-action dialog-action--secondary" href="${escapeHtml(project.bimUrl)}" target="_blank" rel="noopener noreferrer">VER MODELO BIM <span aria-hidden="true">↗</span></a>`
    : `<button type="button" class="dialog-action dialog-action--secondary" aria-disabled="true" id="bim-not-linked" title="Modelo BIM pendiente de vinculación">VER MODELO BIM <span aria-hidden="true">↗</span></button>`;
  dialogBody.innerHTML=`
  <div class="dialog-image" id="detail-image"></div>
  <div class="dialog-details">
    <span class="dialog-kicker">GCP PORTAL / ${escapeHtml(project.category)}</span>
    <h2 class="dialog-title">${safeName}</h2>
    <div class="dialog-rule"></div>
    <p class="dialog-meta"><span>UBICACIÓN</span><strong>${escapeHtml(project.location)}</strong></p>
    <p class="dialog-meta"><span>AÑO</span><strong>${project.year}</strong></p>
    <p class="dialog-note">Datos de ubicación y año ilustrativos para este prototipo. Las fotografías se vinculan al portafolio publicado por GCPEASA.</p>
    <div class="dialog-actions">
      <a class="dialog-action dialog-action--primary" href="${projectHref}" target="_blank" rel="noopener noreferrer">VER PROYECTO <span aria-hidden="true">↗</span></a>
      ${bimLink}
    </div>
    <p class="dialog-feedback" id="dialog-feedback" role="status" aria-live="polite"></p>
  </div>`;
  const display=dialogBody.querySelector('#detail-image');
  if(project.media.type==='video'&&project.media.src){
    const v=document.createElement('video');v.controls=true;v.autoplay=true;v.muted=true;v.playsInline=true;v.loop=true;
    v.src=project.media.src;if(project.media.poster)v.poster=project.media.poster;
    display.append(v);
  }else{
    const img=new Image();img.alt=`Imagen de ${project.name}`;img.src=project.media.fallback;
    img.style.objectPosition=project.media.position||'center';
    display.append(img);
    if(project.media.src){
      const official=new Image();official.decoding='async';
      official.onload=()=>{if(img.isConnected)img.src=project.media.src;};
      official.src=project.media.src;
    }
  }
  dialogBody.querySelector('#bim-not-linked')?.addEventListener('click',()=>{
    dialogBody.querySelector('#dialog-feedback').textContent='Este proyecto aún no tiene un modelo BIM vinculado en el prototipo.';
  });
  dialog.showModal();
}

dialogClose.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>dialogBody.querySelector('video')?.pause());
tabs.forEach(tab=>tab.addEventListener('click',()=>switchSection(tab.dataset.section)));
// HOME usa su enlace relativo nativo para regresar a la portada del portal.

scroller.addEventListener('scroll',()=>{
  const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
  const data=getProjects(sectionState.active);
  const ratio=max?scroller.scrollTop/max:0;
  const page=clamp(1+Math.round(ratio*Math.max(0,Math.ceil(data.length/3)-1)),1,Math.ceil(data.length/3));
  progress.textContent=`${String(page).padStart(2,'0')} — ${String(Math.ceil(data.length/3)).padStart(2,'0')}`;
},{passive:true});
// La matriz no comparte movimiento entre proyectos: no existe RAF global
// ni rotaciones por scroll o por cursor general. El desplazamiento de la lista
// es nativo, y cada celda anima su propia portada exclusivamente mediante CSS.
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)for(const v of grid.querySelectorAll('video'))v.pause();
});

/** Encaja los titulos en la altura REAL de cada portada. Evita los cortes de
 * 'San Telmo Business Towers', 'Infraestructura' y cualquier titulo editable.
 * Sólo modifica la tipografía, no la proporción 32/68 de la portada.
 */
function fitCoverTitles(){
  for(const state of sectionState.cards){
    const label=state.node.querySelector('.book-title');
    if(!label)continue;
    label.style.fontSize='';
    let size=parseFloat(getComputedStyle(label).fontSize);
    let guard=0;
    while(guard++<38 && size>15 &&
      (label.scrollHeight>label.clientHeight+1 || label.scrollWidth>label.clientWidth+1)){
      size=Math.max(15,size-0.7);
      label.style.fontSize=size.toFixed(1)+'px';
    }
  }
}
let titleFitScheduled=false;
function scheduleTitleFit(){
  if(titleFitScheduled)return;
  titleFitScheduled=true;
  requestAnimationFrame(()=>{titleFitScheduled=false;fitCoverTitles();});
}
window.addEventListener('resize',scheduleTitleFit,{passive:true});
document.fonts?.ready?.then(scheduleTitleFit);

renderSection('industrial');
