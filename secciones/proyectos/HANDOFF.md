# HANDOFF — Módulo Proyectos V0.4

- Repositorio: VIZ343/gcp-portal.
- Ruta: secciones/proyectos/index.html.
- Entrada: PROYECTOS en index.html raíz.
- Salida: HOME -> ../../index.html; sin interceptación de prototipo.
- Estado: integrado en rama independiente; revisión/merge posterior.
- Tecnología: HTML/CSS/JS ES Modules nativos; sin paquetes adicionales.
- Layout: 3/2/1 columnas; hover/foco independiente por portada; filtros Industrial/Hábitat y modal.
- Fondo propio: css/background.css y js/background-fallback.js dentro del módulo; no reemplaza fondo global.
- Datos: js/projects.js. Imágenes externas con ocho respaldos locales en assets/preview/.
- Años/ubicaciones ilustrativos y destinos BIM pendientes: se mantienen los avisos originales.
- Se omite PREVIEW_AUTONOMA.html por duplicar la versión modular.
- Validación de integración: rutas relativas de ida/vuelta, imports, respaldos locales y sintaxis JS.
- Pendiente: revisión visual del catálogo integrado; vincular modelos BIM cuando se proporcionen.
