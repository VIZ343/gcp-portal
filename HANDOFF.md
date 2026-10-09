# HANDOFF — GCP_Portal_Base

## Proyecto
GCP_Portal_Base

## Estado
V0.1.1 — base revisada e integrada en GitHub para futuras actualizaciones.

## Arquitectura
- **Home:** `index.html` + `css/home.css` + `js/home.js`.
- **Background:** `css/background.css` + `js/background.js`; compartido por Home y secciones.
- **ModeloCentral:** `js/boot.js` + `js/modelo-central.js` + `assets/modelo-central/`.
- **Secciones:** `secciones/*/index.html` + `css/secciones.css`.

## Decisiones vigentes
- Home siempre es el punto de inicio.
- Background técnico activo en Home y secciones.
- Opacidad de `generated-layer`: `0.72`.
- Logo superior izquierdo con animación de entrada y loop interno cada 30 s.
- Dock inferior: PROYECTOS / CAPACIDADES / EMPRESA / CONTACTO.
- Cada sección regresa a Home.
- Modelo central centrado y reducido respecto a la referencia original.

## Tecnología
HTML / CSS / JavaScript ES Modules / Three.js / Anime.js.

## Limpieza realizada
- Eliminados nombres/versiones heredados V0.x del layout modular.
- Eliminados archivos separados `logo.js`, `dock.js`, `styles.css` y `section.css` al consolidar su función en módulos con nombres de dominio.
- Eliminado markup duplicado del background en cada sección; ahora se genera desde un único módulo.
- Assets del modelo central agrupados en una carpeta específica.

## Próximo paso
Continuar funciones o contenido por módulo sin alterar la base completa cuando no sea necesario.

## Correcciones V0.1.1
- Carga del modelo aislada en boot.js: falla de WebGL/importación/assets muestra imagen alternativa sin bloquear navegación.
- Portada recuperada en pageshow al regresar con historial del navegador.
- Three.js 0.178.0 y Anime.js 4.5.0 locales; versiones fijas.
- 52K instancias desktop; 24K en móviles o <=4 hilos. DPR limitado a 2 / 1.5.
- Render y generación del background suspendidos con pestaña oculta.
- prefers-reduced-motion: fondo estático, transiciones instantáneas y render bajo demanda.
- Wheel conserva zoom Ctrl/Meta y normaliza deltaMode; teclado ignora campos editables.
- Pérdida/restauración de contexto WebGL gestionada.
- Foco visible y lectura mejorada en controles pequeños.

## Publicación
- HTML/CSS/JS estático sin npm, bundler ni build obligatorio.
- Repositorio: https://github.com/VIZ343/gcp-portal
- GitHub Pages desde main (carpeta raíz); cambios propuestos mediante rama y Pull Request.
- Mantener todas las rutas relativas para funcionar bajo /gcp-portal/.
- Las secciones siguen siendo placeholders; añadir contenido por módulo.
- Google Fonts es opcional y conserva fuentes alternativas.
