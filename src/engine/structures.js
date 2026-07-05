export const ESTRUCTURAS = {
  clasica2004: [1, 3, 5, 5, 3, 1, 1, 3, 5, 5, 3, 1],
  alt2004: [1, 3, 5, 6, 6, 5, 3, 1, 1, 3, 5, 6, 6, 5, 3, 1],
  postpandemia: [1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1],
};

export function maxCartas(nJugadores, dosMazos = false) {
  if (nJugadores === 4) return 7;
  if (nJugadores === 6) return 6;
  return dosMazos ? 7 : 5; // 8 jugadores
}

// Acepta un nombre de estructura o un array custom; recorta cada mano al máximo
// de cartas repartibles según jugadores/mazos.
export function estructuraEfectiva(estructura, nJugadores, dosMazos = false) {
  const arr = Array.isArray(estructura) ? estructura : ESTRUCTURAS[estructura];
  const max = maxCartas(nJugadores, dosMazos);
  return arr.map((n) => Math.min(n, max));
}
