# GCP_Portal_Base

Base limpia y modular del portal GCP, desarrollada con apoyo de distintas herramientas de IA (ChatGPT, Claude).

## Inicio
`index.html` es **Home** y debe mantenerse como punto de entrada del proyecto.

## Estructura

```text
GCP_Portal_Base/
├─ index.html                    # Home
├─ assets/
│  ├─ modelo-central/            # Siluetas utilizadas por el modelo central
│  └─ vendor/                    # Dependencias locales y licencias MIT
├─ css/
│  ├─ background.css             # Apariencia del background técnico compartido
│  ├─ home.css                   # Home: modelo, logo, dock y UI
│  └─ secciones.css              # Layout común de secciones
├─ js/
│  ├─ boot.js                    # Carga y recuperación del modelo central
│  ├─ background.js              # Generación/animación del background compartido
│  ├─ home.js                    # Logo + interacción dock de Home
│  └─ modelo-central.js          # Escena Three.js y transiciones del modelo central
└─ secciones/
   ├─ proyectos/index.html
   ├─ capacidades/index.html
   ├─ empresa/index.html
   └─ contacto/index.html
```

## Estado base
- `#generated-layer`: **opacity 0.72**.
- Home conserva logo animado, dock inferior y modelo central.
- El background técnico se comparte entre Home y todas las secciones.
- Las secciones son independientes y por ahora solo contienen título + regreso a Home.
- Modelo central: 52K micro-esferas en escritorio (24K en móviles o equipos de hasta 4 hilos) y flujo `ESFERA → 00_E_2 → 01_E_2 → ARQ_E`.
- No requiere npm ni build.

## Ejecutar
Abrir con Live Server desde la carpeta `GCP_Portal_Base`.

## Dependencias
- Three.js 0.178.0 local en `assets/vendor/` (misma versión del modelo original).
- Anime.js 4.5.0 local en `assets/vendor/` (versión fijada).
- Google Fonts: Cormorant Garamond y Montserrat.

## Regla de integración
Mantener separados los cuatro módulos principales: `Background`, `Home`, `ModeloCentral` y `Secciones`. Evitar volver a duplicar el markup del background dentro de cada página; `js/background.js` lo inyecta desde el contenedor `[data-gcp-background]`.

## Publicación
Se publica con GitHub Pages desde la rama `main` (carpeta raíz).
Todas las rutas internas deben ser **relativas** (sin `/` inicial), porque el sitio se sirve bajo `/nombre-del-repo/`.

## Pendientes
- [ ] (agrega aquí lo siguiente que quieras construir)

## Reglas para la IA
- Cambiar solo lo que se pide; no renombrar variables, clases ni reorganizar código.
- No modificar valores ya ajustados (opacidad del background, cantidad de partículas, secuencia del modelo central) salvo petición explícita.
- No agregar npm, bundlers ni frameworks; el proyecto es HTML/CSS/JS estático.
- No duplicar el markup del background; usar siempre `[data-gcp-background]`.
- Mantener las rutas relativas.
- Devolver el archivo completo modificado e indicar qué líneas cambiaron.
- Hacer un solo cambio por solicitud.

## Versión depurada V0.1.1
- Carga del modelo con recuperación ante errores de WebGL y recursos; navegación siempre disponible.
- Portada visible al regresar mediante el historial del navegador.
- Render y generación del fondo suspendidos al ocultar la pestaña.
- Preferencia de movimiento reducido respetada en el modelo, fondo y logo.
- Límites de partículas y resolución en equipos modestos; se mantiene la secuencia original.
- Zoom del navegador con Ctrl/Meta + rueda conservado y controles con foco visible.
- Sin instalación de paquetes: abrir `index.html` con Live Server desde la raíz del repositorio.

Validación: sintaxis JavaScript, rutas locales y regresión del retorno a Home comprobadas.
Pendiente: revisión visual de animaciones y rendimiento en navegador real.
