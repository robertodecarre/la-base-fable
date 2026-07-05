import { PALOS, VALORES } from './constants.js';

// Mazo español de 40 cartas; el segundo mazo (para 8 jugadores) va sin ases.
export function crearMazo(dosMazos = false) {
  const cartas = [];
  const agregar = (mazo, sinAses) => {
    for (const palo of PALOS) {
      for (const valor of VALORES) {
        if (sinAses && valor === 1) continue;
        cartas.push({ palo, valor, mazo, id: `${palo}-${valor}-${mazo}` });
      }
    }
  };
  agregar(0, false);
  if (dosMazos) agregar(1, true);
  return cartas;
}

// PRNG determinístico (mulberry32) para poder testear repartos con semilla.
export function mulberry32(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mezclar(cartas, rand = Math.random) {
  const arr = [...cartas];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function repartir(mazo, nJugadores, cartasPorJugador) {
  const manos = Array.from({ length: nJugadores }, () => []);
  let k = 0;
  for (let c = 0; c < cartasPorJugador; c++) {
    for (let j = 0; j < nJugadores; j++) {
      manos[j].push(mazo[k++]);
    }
  }
  return manos;
}
