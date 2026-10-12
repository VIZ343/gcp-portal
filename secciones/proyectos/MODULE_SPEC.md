# MODULE: GCP_PROJECTS_SPATIAL_GALLERY

VERSION: V0.4
STATUS: INTEGRATED IN BRANCH / PENDING PR REVIEW
DOMAIN: WEB / INTERACTIVE PORTFOLIO

## Referencias y función

- Richard Mattka / Press: organización de revistas espaciales, scroll con inercia, tilt y profundidad.
- Catalogo_Accesos: cabecera fija, logotipo, título, filtros y contador.
- Ref_02: orientación inicial de revista con canto lateral visible.
- GCP Portal repo (commit base 312589359bd88d5bfa4545da859a254e02f65235): lenguaje de fondo técnico y colores.
- Portafolio GCPEASA: nombres e imágenes enlazadas por URL.

## Core

- Matriz de celdas independientes, 3 columnas desktop, 2 tablet, 1 mobile; cada celda fija establece su propia perspectiva.
- Portada frontal y volumen 3D (front/back/pages/top edge); estado inicial CSS rotateY(-13.5deg), hover/focus frontal rotateY(0deg).
- Header de portada 32%, media 68%, object-fit cover, títulos redimensionados por medición.
- Interacciones: dos estados por proyecto mediante eventos locales, sin transformaciones globales de cursor/scroll; modal y filtros.
- Modal de dos accesos; `bimUrl` opcional con mensaje de pendiente.
- Background con más frecuencia, cantidad y visibilidad, sin escenario artificial.

## Archivos

- index.html
- css/portal.css, css/background.css
- js/app.js, js/projects.js, js/background-fallback.js
- assets/preview/*
- HANDOFF.md

## Datos y configuración

- Projects: `{id,name,section,category,location,year,media,projectUrl?,bimUrl?}`
- Media: `{type:'image'|'video',src,poster?,fallback,position?}`
- Ubicaciones y años: DEMOSTRACIÓN.
- Enlace de proyecto de respaldo: web general GCPEASA; BIM sin destino.

## Diseño de interacción

- `renderSection()` crea tarjetas y controles; `fitCoverTitles()` ajusta texto.
- Cada `gallery-cell` tiene su propia perspectiva y `data-state`, con transiciones CSS independientes y sin `requestAnimationFrame` global.
- `openProject()` construye modal con dos acciones y media.
- Media offscreen: pausada mediante IntersectionObserver.

## Calidad y compatibilidad

- Sin npm / sin build; HTML/CSS/JS nativo.
- Modo de menor movimiento respetado.
- Media fallback incorporada en HTML autónomo para prueba offline.
- Revisión en Chromium 4 viewports, sin errores JS, sin recorte en títulos probados.

## Restricciones

- Mantener la cabecera aprobada. No crear paredes, piso o reflejos 3D.
- Integración solicitada mediante rama/PR; `main` permanece sin cambios hasta fusionar.
- Las URLs de fotos pueden cambiar y deben confirmarse antes de la publicación.
- El motor de Richard Mattka no se ha identificado con certeza; se reconstruye el comportamiento equivalente.

## Estado de aprobación

Integración solicitada por el usuario. Revisión del PR y validación visual pendientes.
Ruta: `secciones/proyectos/`. Home: `../../index.html`.
Se conserva la portada existente y se conecta su acceso PROYECTOS a este módulo.
