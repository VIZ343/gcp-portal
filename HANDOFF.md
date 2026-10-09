# HANDOFF — GCP_Portal_Base

## Proyecto
GCP_Portal_Base

## Estado
Base estable preparada para futuras actualizaciones.

## Arquitectura
- **Home:** `index.html` + `css/home.css` + `js/home.js`.
- **Background:** `css/background.css` + `js/background.js`; compartido por Home y secciones.
- **ModeloCentral:** `js/modelo-central.js` + `assets/modelo-central/`.
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
