<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All app data lives in src/data/*.json and is accessed through src/lib/datos.ts; scoring rules live in src/lib/puntaje.ts with tests — no backend, single source of truth.

## Principios de diseño de interfaz (aplicar en todo el MVP)

### 1. Organización de la ventana/página
- Cada pantalla contiene todos los datos de una tarea; si no es posible, dividir en unidades lógicas según la secuencia de uso.
- Información directamente utilizable: sin consultar otros recursos ni transformaciones mentales de datos.
- Evitar el desorden por exceso de elementos.
- Respetar el orden de barrido visual: centro al comienzo, luego izquierda y derecha, y hacia abajo.
- Elementos críticos al principio, sin esconderlos tras el scroll.
- Definir niveles de importancia (alto a bajo) y aplicarlos de forma consistente en todas las páginas.
- Usar menús pull-down con moderación.
- Evitar múltiples campos en la parte superior: se confunden con la búsqueda.
- Layout líquido/responsivo (flex/grid, unidades relativas).
- Alinear visualmente los elementos, vertical u horizontalmente.
- Evitar pantallas densas; en tareas críticas, minimizar la densidad.

### 2. Formularios
- Parecerse a un formulario en papel (orden, agrupación, etiquetas), con pocas instrucciones.
- Minimizar el ingreso de datos: valores por defecto y no pedir el mismo dato dos veces.
- Un único método de ingreso (evitar saltos entre mouse y teclado).
- Distinguir campos obligatorios de opcionales.
- Autofocus en el primer campo.
- Soportar TAB, ENTER y corrección de errores.
- Anticipar errores típicos (validación preventiva y mensajes claros).
- Acción explícita de procesamiento al final (mínimo Aceptar y Cancelar).
- Botones ordenados por frecuencia de uso: el primero es el más usado y la opción por defecto.
- Consistencia en etiquetado, ingreso, resaltado, justificación y espaciado, dentro y entre pantallas.
- Particionar datos largos (ej.: RUT en grupos XX.XXX.XXX-X).

### 3. Etiquetas y campos
- Cada campo con etiqueta clara, cerca del campo.
- Redacción descriptiva, términos familiares y abreviaciones aceptadas.
- Formato: "Etiqueta:" (dos puntos pegados) o "Etiqueta" sin dos puntos. Nunca "Etiqueta :" ni la etiqueta dentro del campo.
- Unidades o formato en la etiqueta: "Fecha (dd/mm/aaaa)", "Peso: [___] kg". Si hay unidades alternativas, dar un selector.
- Tamaño del campo acorde a la longitud fija o máxima del dato.
- Etiquetas y campos alineados a la izquierda, con espacio hasta el campo; espacio entre grupos de campos.
- Preguntas claras, simples y en positivo; evitar preguntas negativas.
- No exigir pasos innecesarios (ej.: botón "Mostrar" tras elegir un archivo).

### 4. Imágenes y multimedia
- Video, animación o audio solo si ayudan al mensaje; mostrar contenido real, no decorar.
- No poner una imagen grande en la primera pantalla si hay más información bajo el scroll.
- Evitar que las imágenes importantes parezcan publicidad (ceguera al banner).
- Logo de la organización en el mismo lugar en todas las páginas.
- Evitar imágenes de fondo.

### 5. Diseño gráfico
- Balance entre sensación visual e información gráfica y textual.
- Gráfica optimizada que no aumente el tiempo de carga.
- Consistencia visual dentro y entre páginas.
- El diseño gráfico dirige la atención a lo más importante.
- El diseño gráfico es el paso final del diseño centrado en el usuario, no el punto de partida.

### 6. Distribución del espacio en pantalla
- Navegación: menos del 20% del espacio. Contenido: más del 50% (puede ser menor en home y páginas intermedias).
- Reducir el espacio sin usar y el control innecesario del navegador/UI.
- "Data-ink vs chart junk" (Tufte): eliminar todo elemento visual que no aporte información.

### 7. Diseño no antropomórfico
- No presentar el sistema como una persona; usar con cautela caras generadas por computador y personajes animados.
- Evitar el pronombre "yo" en los mensajes del sistema.
- Interfaces comprensibles, predecibles y controlables.
- Apreciaciones globales centradas en el usuario (orientación y cierre).
