# LA BASE — Spec del juego (para reconstruir desde cero)

Juego de cartas español por equipos, tipo "Truco/Envido"-family pero con mecánica de "pedir bases" (similar a Oh Hell / Wizard). Deployado como SPA en React (Vite), un solo componente monolítico `App.jsx` de referencia (adjunto como código, pero se recomienda **rearquitecturar en componentes separados** en la reescritura).

## 1. Concepto central

- 4, 6 u 8 jugadores, divididos en 2 equipos ("Nosotros" / "Ellos") alternados por posición (jugador par = equipo 0, impar = equipo 1).
- Mazo español de 40 cartas (sin 8 ni 9): palos Oros/Copas/Espadas/Bastos, valores 1,2,3,4,5,6,7,10(Sota),11(Caballo),12(Rey).
- Opción "dos mazos": agrega un segundo mazo sin ases (para 8 jugadores).
- Se juega en "manos" (rounds), cada mano reparte N cartas según una **estructura** predefinida (ej. `[1,3,5,5,3,1,1,3,5,5,3,1]` = cantidad de cartas por mano en secuencia). Estructuras disponibles: `clasica2004`, `alt2004`, `postpandemia`.
- Dentro de cada mano se juegan tantas "bases" (bazas/tricks) como cartas repartidas.

## 2. Flujo de una mano

1. **Repartir**: se reparte N cartas por jugador (mezclando mazo fresco cada mano).
2. **Pedir**: antes de jugar, cada equipo "pide" cuántas bases cree que va a ganar.
   - Primero pide el equipo del jugador "mano" (el anterior al "pie" en sentido de reparto), después el equipo "pie".
   - Regla clave: la suma de ambos pedidos **no puede ser igual al total de bases** de la mano (para que no den ambos exacto) — debe ser total±1. `opcionesValidas()` calcula las opciones válidas para el segundo equipo en pedir dado lo que pidió el primero.
   - Solo un "capitán" designado por equipo puede confirmar el pedido (no cualquier jugador del equipo).
3. **Kamikaze** (declaración especial, opcional, cantidad limitada por partida ej. 1): el equipo mano puede declarar antes de pedir que va a "kamikazear" — se compromete a pedir 0 o el total exacto de bases (todo o nada). Si un equipo termina la mano con -2 o peor sin haber declarado kamikaze, pierde automáticamente la partida ("kamikaze no declarado").
4. **Jugar bases**: por turnos (empezando por "mano", sentido antihorario salvo que As de Copas invierta), cada jugador tira una carta. Cuando todos tiraron (ronda completa), se resuelve la base.
5. **Resolución de base**: gana quien tiró la carta de mayor jerarquía (ver sección 3), salvo interacción de Ases (sección 4). Empate de jerarquía → gana quien jugó primero (más cercano al mano).
6. **Cerrar mano**: al terminar todas las bases, se calculan puntos (sección 5) y se pasa a la siguiente mano (el "pie" rota +1 jugador).
7. **Fin de partida**: cuando se termina la estructura completa, o por kamikaze no declarado, o por tiempo agotado en modo "muerte súbita".

## 3. Jerarquía de cartas

Orden normal: 12 > 11 > 10 > 7 > 6 > 5 > 4 > 3 > 2 > 1, **excepto** el As de Bastos ("el Ancho"), que es la carta más poderosa de todas (jerarquía 100) — salvo que lo mate el As de Espadas (ver abajo).

## 4. Superpoderes de los Ases (activables/desactivables por config antes de la partida)

- **As de Bastos (Ancho)**: máxima jerarquía siempre. Es el "poder base" del juego, no es opcional.
- **As de Espadas**: si se juega en la misma base **después** de que ya se jugó el Ancho de Bastos, el As de Espadas lo mata y gana la base (sin importar orden normal de jerarquía).
- **As de Copas**: al jugarse, quien lo tiró elige si el sentido de juego sigue igual o se invierte (antihorario ↔ horario) a partir de ese momento. Si es la última carta de la ronda, la elección aplica a quién abre la base siguiente.
- **As de Oros**: si el equipo de quien lo jugó gana la base, ese jugador elige quién abre la base siguiente (en vez de que abra automáticamente el ganador).

Cada superpoder se puede activar/desactivar independientemente en la pantalla de configuración inicial.

## 5. Cálculo de puntos al cerrar la mano

Dado lo pedido (pedN, pedE) y lo realmente hecho (hechoN, hechoE) por cada equipo:
- Si un equipo cumplió exacto su pedido y el otro no: el que cumplió suma `10 + hecho` puntos; el que falló resta `|hecho - pedido|`.
- Si ninguno cumplió exacto (o ambos, caso imposible por regla de pedido): cada uno resta `|hecho - pedido|`.
- Kamikaze no declarado con resultado ≤ -2 en el equipo mano → pierde la partida inmediatamente, sin importar el marcador acumulado.
- Al final de la partida gana quien tenga más puntos acumulados sobre todas las manos.

## 6. Modos de tiempo (opcionales)

- Reloj tipo ajedrez, un tiempo total por equipo (configurable en minutos), que corre mientras es el turno de pedir/jugar de ese equipo.
- **Modo "muerte súbita"**: si se agota el tiempo de un equipo, pierde la partida en el acto.
- **Modo "deportivo/rápido"**: si se agota el tiempo, no se pierde, pero pasa a jugar con 10 segundos por jugada (countdown visual), auto-confirmando la opción por defecto si no elige a tiempo.

## 7. Configuración inicial (pantalla de inicio)

- Cantidad de jugadores (4/6/8) y sus nombres (nombres por defecto: Micho, Tincho, Leo, Negro, Gordo, CabezonIA, Flaco, Pelado).
- Estructura de manos a usar.
- Uso de dos mazos (solo relevante con 8 jugadores).
- Máximo de cartas por mano según jugadores/mazo (`maxCartas`: 4j→7, 6j→6, 8j un mazo→5, 8j dos mazos→7).
- Tiempo total opcional + modo de tiempo (muerte/deportivo).
- Cantidad de kamikazes disponibles por partida.
- Activar/desactivar cada superpoder de As (espadas, copas, oros — el de bastos siempre activo).
- Nombre de "capitán" por equipo (quién confirma los pedidos).

Después de configurar: **pantalla de sorteo** (elige al azar quién es "pie" inicial) → **pantalla de partida**.

## 8. UI / presentación (referencia, no bloqueante para la reescritura)

- Mesa circular: jugadores distribuidos en círculo según ángulos fijos por cantidad de jugadores (4/6/8), con posiciones en sentido definido por `POS_ANGULOS`.
- Cartas dibujadas 100% en SVG generado por código (nada de imágenes/assets externos): as de bastos, as de oros, as de copas, as de espadas, figuras (sota/caballo/rey) con diseño ilustrado propio. Esto se puede simplificar bastante en la reescritura (ej. usar un set de SVGs más simple o una librería) salvo que el objetivo sea preservar la estética actual.
- Paleta de colores por palo: Oros dorado, Copas rojo, Espadas azul oscuro/negro, Bastos verde oscuro.
- Tema visual general: pergamino/verde oscuro, tipografías Cinzel (títulos) + Crimson Text (cuerpo), estética "mesa de casino antiguo".
- Panel de "pedir" con selector numérico y countdown visual en modo rápido.
- Tablero lateral con historial de puntos por mano.
- Botón de reinicio de partida con modal de confirmación.

## 9. Cosas a decidir/mejorar en la reescritura con Fable 5

- Separar en componentes/archivos (hoy todo vive en un solo `App.jsx` de ~1700 líneas).
- Extraer la lógica de reglas (jerarquía, puntos, ases, kamikaze) a funciones puras testeables, separadas de la UI.
- Considerar manejo de estado con reducer/store en vez de tantos `useState` sueltos.
- Decidir si se mantiene el estilo "todo dibujado en SVG inline" o se simplifica.
- Multiplayer real (hoy es todo local/hotseat en un solo dispositivo) — evaluar si vale la pena para esta prueba con Fable o se mantiene local.

## 10. Referencia de código

Se adjunta el código fuente completo (`la-base-source.zip`) como referencia opcional — pasárselo a Fable solo si necesita mirar el detalle exacto de una regla o de un dibujo SVG. Para la reescritura desde cero, este spec debería alcanzar como input principal y ahorra muchísimos tokens vs. pegar los ~1700 líneas del archivo original.
