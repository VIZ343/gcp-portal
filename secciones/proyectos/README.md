# GCP Portal — Catálogo de proyectos V0.4

**ESTADO:** V0.4 integrada en rama de GitHub para revisión mediante Pull Request.

## Abrir

- Abrir el `index.html` de la raíz del repositorio con Live Server y seleccionar PROYECTOS.
- Entrada del módulo: `secciones/proyectos/index.html`.
- HOME regresa a `../../index.html`.
- No requiere instalar dependencias.

## Corrección V0.4 — Matriz independiente

La V0.3 aplicaba variables compartidas de cursor, proximidad y scroll a cada elemento en un `requestAnimationFrame` global. Aunque existían tres columnas, esto producía una sensación de movimiento conjunto.

En V0.4:

- `#gallery-grid` distribuye únicamente; **no se transforma**.
- Cada proyecto vive en una `.gallery-cell` con un espacio fijo y `perspective` propia.
- Dentro de cada celda, solamente `.gallery-item` (el libro) cambia de estado.
- **Inicial:** `rotateY(-13.5deg)` con grosor y canto visible, como Ref_04.
- **Hover / teclado:** `rotateY(0deg)`, ligera elevación y escala, como Ref_05.
- La perspectiva no varía por fila, posición, scroll ni movimiento del cursor fuera de esa celda.
- El cambio de un proyecto no modifica la transformación de sus vecinos.
- CSS gestiona las transiciones; eliminado el bucle de transformación global, reduciendo trabajo por fotograma.
- Layout: 3 columnas en escritorio; 2 en tableta; 1 en móvil.

## Parámetros editables

En `css/portal.css`, bloque `:root`:

| Variable | Uso |
|---|---|
| `--cover-rest-rotate-y` | Inclinación inicial, -13.5deg |
| `--cover-rest-rotate-x` | Inclinación vertical inicial, .85deg |
| `--cover-hover-lift` | Elevación al hover, -8px |
| `--cover-hover-depth` | Avance en Z al hover, 32px |
| `--cover-hover-scale` | Escala del proyecto activo, 1.035 |
| `--cell-perspective` | Perspectiva independiente, 1100px |

## Contenido y elementos conservados

- Cabecera `Catalogo_Accesos`, categorías Industrial/Hábitat.
- Fotos desde el portafolio de GCPEASA con respaldo de maqueta local.
- La parte fotográfica ocupa el 68 % del alto de portada con `object-fit: cover`.
- Ventana emergente: **Ver proyecto** / **Ver Modelo BIM**.
- Background de GCP modificado en V0.2 para aumentar visibilidad y frecuencia.
- Años y ubicaciones ilustrativos; enlace BIM sin destino hasta su integración.
- Fotos y clips se cambian en `js/projects.js`.

## Archivos

- `index.html`: página modular.
- `css/portal.css`: matriz, portadas y estados independientes.
- `js/app.js`: tarjetas, activación local, categorías y modal.
- `js/projects.js`: datos y medios.
- `css/background.css`, `js/background-fallback.js`: background técnico.
- `assets/preview/`: fotos de respaldo, **no son fotos oficiales de los proyectos**.
- La vista autónoma del ZIP no se incorpora al sitio: se usa la versión modular.

## Pendiente

Revisión visual del módulo integrado y posterior fusión del Pull Request.
Los destinos BIM y los datos ilustrativos se mantienen como fueron entregados.
