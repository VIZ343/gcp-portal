// Mantiene la navegación disponible si falla WebGL o un recurso del modelo.
const loading = document.querySelector('#loading');
const status = document.querySelector('#status');
let timeout;
function fail(error) {
  console.error('[GCP ModeloCentral]', error);
  clearTimeout(timeout);
  loading.classList.add('is-hidden');
  status.textContent = 'MODELO NO DISPONIBLE';
  document.querySelector('#scrollHint').textContent = '';
  document.querySelector('#stage').innerHTML = '<img class="model-fallback" src="./assets/modelo-central/Arq_E.png" alt="Modelo arquitectónico" />';
}
timeout = setTimeout(() => loading.classList.add('is-hidden'), 20000);
try {
  const { initializeCentral } = await import('./modelo-central.js');
  await initializeCentral();
  clearTimeout(timeout);
} catch (error) { fail(error); }
