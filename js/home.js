// HOME — comportamiento del logo y dock de navegación.

(() => {
  const logo = document.getElementById('brandLogo');
  if (!logo) return;

  const INTRO_MS = 1900;
  const LOOP_EVERY_MS = 30000;
  const LOOP_MS = 2900;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;
  let intervalId = null;
  let loopTimeoutId = null;

  function runLoop() {
    if(document.hidden || reduceMotion)return;
    logo.classList.remove('brand-loop');
    void logo.getBoundingClientRect();
    logo.classList.add('brand-loop');
    clearTimeout(loopTimeoutId);
    loopTimeoutId = setTimeout(() => logo.classList.remove('brand-loop'), LOOP_MS);
  }

  function start() {
    if (started) return;
    started = true;
    if(reduceMotion){logo.classList.add('brand-ready');return;}
    logo.classList.add('brand-intro');

    setTimeout(() => {
      logo.classList.remove('brand-intro');
      logo.classList.add('brand-ready');
      intervalId = setInterval(runLoop, LOOP_EVERY_MS);
    }, INTRO_MS);
  }

  window.addEventListener('gcp:central-ready', start, { once: true });
  window.addEventListener('load', () => setTimeout(start, 900), { once: true });
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
    clearTimeout(loopTimeoutId);
  });
})();

(() => {
  const dock = document.getElementById('homeDock');
  if (!dock) return;

  window.addEventListener('pageshow', () => document.body.classList.remove('nav-leave'));
  const items = [...dock.querySelectorAll('.dock-item')];
  const dividers = [...dock.querySelectorAll('.dock-divider')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resetDock = () => {
    items.forEach((item) => {
      item.style.setProperty('--dock-scale', '1');
      item.style.setProperty('--dock-lift', '0px');
    });
    dividers.forEach((divider) => {
      divider.style.transform = 'scaleY(1)';
      divider.style.opacity = '1';
    });
  };

  if (!reduceMotion) {
    dock.addEventListener('pointermove', (event) => {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(event.clientX - center);
        const radius = Math.max(150, rect.width * 1.65);
        const influence = Math.max(0, 1 - distance / radius);
        const eased = influence * influence * (3 - 2 * influence);
        const scale = 1 + eased * 0.13;
        const lift = -eased * 8;
        item.style.setProperty('--dock-scale', scale.toFixed(3));
        item.style.setProperty('--dock-lift', `${lift.toFixed(2)}px`);
      });

      dividers.forEach((divider) => {
        const rect = divider.getBoundingClientRect();
        const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
        const influence = Math.max(0, 1 - distance / 170);
        divider.style.transform = `scaleY(${(1 + influence * .22).toFixed(3)})`;
        divider.style.opacity = String(1 - influence * .24);
      });
    });

    dock.addEventListener('pointerleave', resetDock);
  }

  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const href = item.getAttribute('href');
      document.body.classList.add('nav-leave');
      window.setTimeout(() => { window.location.href = href; }, reduceMotion ? 0 : 230);
    });
  });
})();
