import { crearMazo, mezclar, repartir, mulberry32 } from './deck.js';
import { resolverBase } from './trick.js';
import { esAsCopas, esAsOros } from './hierarchy.js';
import { opcionesPrimerPedido, opcionesValidas } from './bidding.js';
import { puntajeMano, esKamikazeNoDeclarado } from './scoring.js';
import { estructuraEfectiva } from './structures.js';
import { NOMBRES_DEFAULT } from './constants.js';

// Fases: config → sorteo → pedir → jugar (→ elegir-sentido / elegir-abridor)
//        → fin-mano → (pedir de la mano siguiente | fin-partida)
//
// Convenciones:
// - Equipo de un jugador: índice % 2 (par = Nosotros, impar = Ellos).
// - sentido: +1 = antihorario (default), -1 = horario (invertido por As de Copas).
// - "pie" es el repartidor; "jugadorMano" es el siguiente al pie en el sentido
//   de juego y abre la primera base. El pie rota +1 (mod nJugadores) por mano.
// - indiceMano es la posición dentro de la estructura de la partida;
//   "base" es cada baza/trick dentro de una mano.
// - Acciones inválidas (fuera de fase, fuera de turno, valor ilegal) devuelven
//   el estado sin cambios.

export function configDefault() {
  return {
    nJugadores: 4,
    nombres: null, // null → NOMBRES_DEFAULT recortado a nJugadores
    estructura: 'clasica2004',
    estructuraCustom: null, // array explícito de cartas por mano (tests / variantes)
    dosMazos: false,
    kamikazes: 1, // pool único compartido por toda la partida
    ases: { espadas: true, copas: true, oros: true },
    capitanes: [0, 1], // índice de jugador que confirma pedidos, por equipo
    tiempo: null, // { minutos, modo: 'muerte' | 'deportivo' }
    semilla: null, // null → Date.now()
  };
}

export function estadoInicial(config = configDefault()) {
  return { fase: 'config', config };
}

export const equipoDe = (jugador) => jugador % 2;

export function opcionesDePedido(estado) {
  if (estado.fase !== 'pedir') return [];
  const equipoMano = equipoDe(estado.jugadorMano);
  if (estado.turnoPedir === equipoMano) {
    return opcionesPrimerPedido(estado.nBases, estado.kamikazeDeclarado === equipoMano);
  }
  return opcionesValidas(estado.pedidos[equipoMano], estado.nBases);
}

export function gameReducer(estado, accion) {
  switch (accion.type) {
    case 'INICIAR_PARTIDA':
      return iniciarPartida(estado, accion);
    case 'SORTEAR':
      return sortear(estado, accion);
    case 'DECLARAR_KAMIKAZE':
      return declararKamikaze(estado, accion);
    case 'PEDIR':
      return pedir(estado, accion);
    case 'JUGAR_CARTA':
      return jugarCarta(estado, accion);
    case 'ELEGIR_SENTIDO':
      return elegirSentido(estado, accion);
    case 'ELEGIR_ABRIDOR':
      return elegirAbridor(estado, accion);
    case 'CONTINUAR':
      return continuar(estado, accion);
    case 'TIEMPO_AGOTADO':
      return tiempoAgotado(estado, accion);
    case 'REINICIAR':
      return estadoInicial(estado.config);
    default:
      return estado;
  }
}

function iniciarPartida(estado, accion) {
  const base = configDefault();
  const cfg = {
    ...base,
    ...accion.config,
    ases: { ...base.ases, ...(accion.config?.ases ?? {}) },
  };
  if (![4, 6, 8].includes(cfg.nJugadores)) return estado;
  if (!cfg.nombres) cfg.nombres = NOMBRES_DEFAULT.slice(0, cfg.nJugadores);
  const capitanesValidos = [0, 1].every(
    (eq) =>
      Number.isInteger(cfg.capitanes[eq]) &&
      cfg.capitanes[eq] >= 0 &&
      cfg.capitanes[eq] < cfg.nJugadores &&
      cfg.capitanes[eq] % 2 === eq,
  );
  if (!capitanesValidos) cfg.capitanes = [0, 1];
  const cartasPorMano = estructuraEfectiva(
    cfg.estructuraCustom ?? cfg.estructura,
    cfg.nJugadores,
    cfg.dosMazos,
  );
  return {
    fase: 'sorteo',
    config: cfg,
    cartasPorMano,
    semilla: (cfg.semilla ?? Date.now()) >>> 0,
    puntos: [0, 0],
    historial: [],
    kamikazesRestantes: cfg.kamikazes,
    modoRapido: [false, false],
    indiceMano: 0,
    pie: null,
    ganadorPartida: null,
    motivoFin: null,
  };
}

function sortear(estado, accion) {
  if (estado.fase !== 'sorteo') return estado;
  const rand = mulberry32(estado.semilla);
  const pie = accion.pie ?? Math.floor(rand() * estado.config.nJugadores);
  const semilla = Math.floor(rand() * 2 ** 31);
  return repartirNuevaMano({ ...estado, semilla, pie }, accion.manosForzadas);
}

function repartirNuevaMano(estado, manosForzadas) {
  const { config, indiceMano, cartasPorMano } = estado;
  const n = config.nJugadores;
  const nCartas = cartasPorMano[indiceMano];
  let manos = manosForzadas;
  let semilla = estado.semilla;
  if (!manos) {
    const rand = mulberry32(semilla);
    const mazo = mezclar(crearMazo(config.dosMazos), rand);
    manos = repartir(mazo, n, nCartas);
    semilla = Math.floor(rand() * 2 ** 31);
  }
  const jugadorMano = (estado.pie + 1) % n; // sentido inicial siempre antihorario
  return {
    ...estado,
    semilla,
    fase: 'pedir',
    manos,
    nBases: nCartas,
    sentido: 1,
    jugadorMano,
    turnoPedir: equipoDe(jugadorMano),
    pedidos: [null, null],
    kamikazeDeclarado: null,
    hechos: [0, 0],
    baseActual: [],
    basesJugadas: 0,
    registroBases: [],
    abridor: jugadorMano,
    turno: jugadorMano,
    pendienteCopas: null,
    pendienteOros: null,
  };
}

function declararKamikaze(estado, { jugador } = {}) {
  if (estado.fase !== 'pedir') return estado;
  const equipoMano = equipoDe(estado.jugadorMano);
  if (estado.turnoPedir !== equipoMano) return estado; // solo antes del pedido del equipo mano
  if (estado.config.capitanes[equipoMano] !== jugador) return estado;
  if (estado.kamikazeDeclarado !== null || estado.kamikazesRestantes <= 0) return estado;
  return {
    ...estado,
    kamikazeDeclarado: equipoMano,
    kamikazesRestantes: estado.kamikazesRestantes - 1,
  };
}

function pedir(estado, { equipo, jugador, valor }) {
  if (estado.fase !== 'pedir' || equipo !== estado.turnoPedir) return estado;
  if (estado.config.capitanes[equipo] !== jugador) return estado;
  if (!opcionesDePedido(estado).includes(valor)) return estado;
  const pedidos = [...estado.pedidos];
  pedidos[equipo] = valor;
  const otro = 1 - equipo;
  if (pedidos[otro] === null) return { ...estado, pedidos, turnoPedir: otro };
  return { ...estado, pedidos, turnoPedir: null, fase: 'jugar' };
}

function jugarCarta(estado, { jugador, cartaId }) {
  if (estado.fase !== 'jugar' || jugador !== estado.turno) return estado;
  const carta = estado.manos[jugador].find((c) => c.id === cartaId);
  if (!carta) return estado;
  const manos = estado.manos.map((m, i) =>
    i === jugador ? m.filter((c) => c.id !== cartaId) : m,
  );
  const nuevo = {
    ...estado,
    manos,
    baseActual: [...estado.baseActual, { jugador, carta }],
  };
  if (estado.config.ases.copas && esAsCopas(carta)) {
    return { ...nuevo, fase: 'elegir-sentido', pendienteCopas: jugador };
  }
  return avanzar(nuevo);
}

function elegirSentido(estado, { invertir }) {
  if (estado.fase !== 'elegir-sentido') return estado;
  return avanzar({
    ...estado,
    fase: 'jugar',
    pendienteCopas: null,
    sentido: invertir ? -estado.sentido : estado.sentido,
  });
}

function avanzar(estado) {
  const n = estado.config.nJugadores;
  if (estado.baseActual.length < n) {
    return { ...estado, turno: (estado.turno + estado.sentido + n) % n };
  }
  const { ganador, motivo } = resolverBase(estado.baseActual, estado.config.ases);
  const hechos = [...estado.hechos];
  hechos[equipoDe(ganador)]++;
  const nuevo = {
    ...estado,
    hechos,
    basesJugadas: estado.basesJugadas + 1,
    registroBases: [
      ...estado.registroBases,
      { jugadas: estado.baseActual, ganador, motivo },
    ],
  };
  if (estado.config.ases.oros && nuevo.basesJugadas < estado.nBases) {
    const jugadaOros = estado.baseActual.find((j) => esAsOros(j.carta));
    if (jugadaOros && equipoDe(jugadaOros.jugador) === equipoDe(ganador)) {
      return { ...nuevo, fase: 'elegir-abridor', pendienteOros: jugadaOros.jugador };
    }
  }
  return siguienteBase(nuevo, ganador);
}

function elegirAbridor(estado, { jugador }) {
  if (estado.fase !== 'elegir-abridor') return estado;
  if (!Number.isInteger(jugador) || jugador < 0 || jugador >= estado.config.nJugadores) {
    return estado;
  }
  return siguienteBase({ ...estado, pendienteOros: null }, jugador);
}

function siguienteBase(estado, abridor) {
  if (estado.basesJugadas >= estado.nBases) return cerrarMano(estado);
  return { ...estado, fase: 'jugar', baseActual: [], abridor, turno: abridor };
}

function cerrarMano(estado) {
  const deltas = puntajeMano(estado.pedidos, estado.hechos);
  const puntos = [estado.puntos[0] + deltas[0], estado.puntos[1] + deltas[1]];
  const historial = [
    ...estado.historial,
    {
      indiceMano: estado.indiceMano,
      nBases: estado.nBases,
      pedidos: estado.pedidos,
      hechos: estado.hechos,
      deltas,
      kamikazeDeclarado: estado.kamikazeDeclarado,
    },
  ];
  const nuevo = { ...estado, puntos, historial, baseActual: [] };
  const equipoMano = equipoDe(estado.jugadorMano);
  if (esKamikazeNoDeclarado(deltas[equipoMano], estado.kamikazeDeclarado === equipoMano)) {
    return {
      ...nuevo,
      fase: 'fin-partida',
      ganadorPartida: 1 - equipoMano,
      motivoFin: 'kamikaze-no-declarado',
    };
  }
  if (estado.indiceMano + 1 >= estado.cartasPorMano.length) {
    return {
      ...nuevo,
      fase: 'fin-partida',
      ganadorPartida:
        puntos[0] === puntos[1] ? 'empate' : puntos[0] > puntos[1] ? 0 : 1,
      motivoFin: 'estructura-completa',
    };
  }
  return { ...nuevo, fase: 'fin-mano' };
}

function continuar(estado, accion) {
  if (estado.fase !== 'fin-mano') return estado;
  return repartirNuevaMano(
    {
      ...estado,
      indiceMano: estado.indiceMano + 1,
      pie: (estado.pie + 1) % estado.config.nJugadores,
    },
    accion.manosForzadas,
  );
}

function tiempoAgotado(estado, { equipo }) {
  if (!estado.config.tiempo) return estado;
  if (['config', 'sorteo', 'fin-partida'].includes(estado.fase)) return estado;
  if (estado.config.tiempo.modo === 'muerte') {
    return { ...estado, fase: 'fin-partida', ganadorPartida: 1 - equipo, motivoFin: 'tiempo' };
  }
  const modoRapido = [...estado.modoRapido];
  modoRapido[equipo] = true;
  return { ...estado, modoRapido };
}
