import { describe, it, expect } from 'vitest';
import { gameReducer, estadoInicial, opcionesDePedido, equipoDe } from './game.js';

const C = (palo, valor, mazo = 0) => ({ palo, valor, mazo, id: `${palo}-${valor}-${mazo}` });

const juega = (estado, jugador, palo, valor, mazo = 0) =>
  gameReducer(estado, { type: 'JUGAR_CARTA', jugador, cartaId: `${palo}-${valor}-${mazo}` });

const pide = (estado, equipo, valor) =>
  gameReducer(estado, {
    type: 'PEDIR',
    equipo,
    jugador: estado.config.capitanes[equipo],
    valor,
  });

const declaraKamikaze = (estado, equipo) =>
  gameReducer(estado, {
    type: 'DECLARAR_KAMIKAZE',
    jugador: estado.config.capitanes[equipo],
  });

// Arranca una partida y sortea con pie y manos forzadas.
function partida({
  nJugadores = 4,
  estructura = [3],
  manos,
  pie = 3,
  ases,
  kamikazes = 1,
  tiempo = null,
} = {}) {
  let e = gameReducer(estadoInicial(), {
    type: 'INICIAR_PARTIDA',
    config: { nJugadores, estructuraCustom: estructura, ases, kamikazes, tiempo, semilla: 42 },
  });
  return gameReducer(e, { type: 'SORTEAR', pie, manosForzadas: manos });
}

describe('mano completa de 3 bases (espadas mata ancho, oros sin efecto, copas en última carta)', () => {
  const manos = [
    [C('espadas', 7), C('oros', 3), C('bastos', 2)],
    [C('bastos', 1), C('oros', 5), C('copas', 1)],
    [C('espadas', 1), C('oros', 12), C('copas', 4)],
    [C('copas', 12), C('oros', 1), C('bastos', 6)],
  ];

  it('se juega entera y puntúa bien', () => {
    let e = partida({ manos });
    // pie=3 → jugadorMano=0, pide primero el equipo 0
    expect(e.fase).toBe('pedir');
    expect(e.jugadorMano).toBe(0);
    expect(e.turnoPedir).toBe(0);
    expect(opcionesDePedido(e)).toEqual([0, 1, 2, 3]);

    e = pide(e, 0, 2);
    expect(e.turnoPedir).toBe(1);
    expect(opcionesDePedido(e)).toEqual([0, 2]); // suma 2 o 4 con total 3

    e = pide(e, 1, 0);
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(0);

    // Base 1: el As de Espadas (P2) mata al Ancho (P1)
    e = juega(e, 0, 'espadas', 7);
    e = juega(e, 1, 'bastos', 1);
    e = juega(e, 2, 'espadas', 1);
    e = juega(e, 3, 'copas', 12);
    expect(e.registroBases[0].ganador).toBe(2);
    expect(e.registroBases[0].motivo).toBe('espadas-mata-ancho');
    expect(e.hechos).toEqual([1, 0]);
    expect(e.turno).toBe(2); // abre el ganador

    // Base 2: P3 tira el As de Oros pero su equipo pierde la base → sin elección
    e = juega(e, 2, 'oros', 12);
    e = juega(e, 3, 'oros', 1);
    e = juega(e, 0, 'oros', 3);
    e = juega(e, 1, 'oros', 5);
    expect(e.fase).toBe('jugar');
    expect(e.registroBases[1].ganador).toBe(2);
    expect(e.hechos).toEqual([2, 0]);

    // Base 3: P1 cierra con el As de Copas → elige sentido aunque sea la última carta
    e = juega(e, 2, 'copas', 4);
    e = juega(e, 3, 'bastos', 6);
    e = juega(e, 0, 'bastos', 2);
    e = juega(e, 1, 'copas', 1);
    expect(e.fase).toBe('elegir-sentido');
    expect(e.pendienteCopas).toBe(1);

    e = gameReducer(e, { type: 'ELEGIR_SENTIDO', invertir: true });
    expect(e.registroBases[2].ganador).toBe(3); // bastos-6 fue la más alta
    expect(e.hechos).toEqual([2, 1]);

    // Equipo 0 pidió 2 e hizo 2 (+12); equipo 1 pidió 0 e hizo 1 (-1)
    expect(e.fase).toBe('fin-partida'); // estructura de una sola mano
    expect(e.puntos).toEqual([12, -1]);
    expect(e.historial).toHaveLength(1);
    expect(e.historial[0].deltas).toEqual([12, -1]);
    expect(e.ganadorPartida).toBe(0);
    expect(e.motivoFin).toBe('estructura-completa');
  });
});

describe('As de Copas a mitad de base', () => {
  const manos = [
    [C('copas', 1), C('oros', 2)],
    [C('oros', 4), C('copas', 2)],
    [C('oros', 6), C('copas', 3)],
    [C('oros', 7), C('copas', 5)],
  ];

  it('invierte el sentido para las cartas que faltan y las bases siguientes', () => {
    let e = partida({ manos, estructura: [2] });
    e = pide(e, 0, 1);
    e = pide(e, 1, 0);

    e = juega(e, 0, 'copas', 1);
    expect(e.fase).toBe('elegir-sentido');
    e = gameReducer(e, { type: 'ELEGIR_SENTIDO', invertir: true });

    expect(e.sentido).toBe(-1);
    expect(e.turno).toBe(3); // ya no le toca al 1, la ronda va al revés
    e = juega(e, 3, 'oros', 7);
    expect(e.turno).toBe(2);
    e = juega(e, 2, 'oros', 6);
    e = juega(e, 1, 'oros', 4);
    expect(e.registroBases[0].ganador).toBe(3);

    // Base 2: abre P3 y el orden sigue invertido
    expect(e.turno).toBe(3);
    e = juega(e, 3, 'copas', 5);
    expect(e.turno).toBe(2);
    e = juega(e, 2, 'copas', 3);
    e = juega(e, 1, 'copas', 2);
    e = juega(e, 0, 'oros', 2);
    expect(e.registroBases[1].ganador).toBe(3);

    // Nadie cumplió: equipo 0 pidió 1/hizo 0, equipo 1 pidió 0/hizo 2.
    // El -2 del equipo 1 NO pierde la partida: la regla kamikaze es solo para el equipo mano.
    expect(e.fase).toBe('fin-partida');
    expect(e.motivoFin).toBe('estructura-completa');
    expect(e.puntos).toEqual([-1, -2]);
    expect(e.ganadorPartida).toBe(0);
  });

  it('con el superpoder de copas desactivado no hay interrupción', () => {
    let e = partida({ manos, estructura: [2], ases: { copas: false } });
    e = pide(e, 0, 1);
    e = pide(e, 1, 0);
    e = juega(e, 0, 'copas', 1);
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(1);
    expect(e.sentido).toBe(1);
  });
});

describe('As de Oros', () => {
  const manos = [
    [C('oros', 1), C('copas', 2)],
    [C('bastos', 3), C('copas', 3)],
    [C('espadas', 12), C('copas', 4)],
    [C('bastos', 2), C('copas', 5)],
  ];

  it('si su equipo gana la base, quien lo jugó elige el abridor siguiente', () => {
    let e = partida({ manos, estructura: [2] });
    e = pide(e, 0, 1);
    e = pide(e, 1, 0);

    e = juega(e, 0, 'oros', 1);
    e = juega(e, 1, 'bastos', 3);
    e = juega(e, 2, 'espadas', 12);
    e = juega(e, 3, 'bastos', 2);
    // Ganó P2 (equipo 0), el oros lo tiró P0 (equipo 0) → P0 elige
    expect(e.fase).toBe('elegir-abridor');
    expect(e.pendienteOros).toBe(0);

    e = gameReducer(e, { type: 'ELEGIR_ABRIDOR', jugador: 3 });
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(3);
    expect(e.abridor).toBe(3);

    e = juega(e, 3, 'copas', 5);
    e = juega(e, 0, 'copas', 2);
    e = juega(e, 1, 'copas', 3);
    e = juega(e, 2, 'copas', 4);
    expect(e.hechos).toEqual([1, 1]);
    expect(e.puntos).toEqual([11, -1]);
  });

  it('en la última base de la mano no hay elección (no hay base siguiente)', () => {
    const manosCortas = [
      [C('oros', 1)],
      [C('copas', 2)],
      [C('oros', 12)],
      [C('copas', 3)],
    ];
    let e = partida({ manos: manosCortas, estructura: [1] });
    e = pide(e, 0, 1);
    e = pide(e, 1, 1); // con total 1 y primer pedido 1, el único valor legal es 1
    e = juega(e, 0, 'oros', 1);
    e = juega(e, 1, 'copas', 2);
    e = juega(e, 2, 'oros', 12);
    e = juega(e, 3, 'copas', 3);
    // Ganó el equipo del oros, pero era la última base → directo al cierre
    expect(e.fase).toBe('fin-partida');
    expect(e.puntos).toEqual([11, -1]);
  });
});

describe('kamikaze', () => {
  const manos = [
    [C('bastos', 1), C('oros', 12)],
    [C('copas', 2), C('copas', 3)],
    [C('bastos', 4), C('bastos', 5)],
    [C('espadas', 6), C('espadas', 7)],
  ];

  it('declarado: restringe el pedido a todo o nada y blinda contra el -2', () => {
    let e = partida({ manos, estructura: [2], ases: { espadas: false } });
    e = declaraKamikaze(e, 0);
    expect(e.kamikazeDeclarado).toBe(0);
    expect(e.kamikazesRestantes).toBe(0);
    expect(opcionesDePedido(e)).toEqual([0, 2]);

    e = pide(e, 0, 0);
    expect(opcionesDePedido(e)).toEqual([1]);
    e = pide(e, 1, 1);

    // El equipo 0 gana las dos bases: pidió 0, hizo 2 → -2, pero declaró
    e = juega(e, 0, 'bastos', 1);
    e = juega(e, 1, 'copas', 2);
    e = juega(e, 2, 'bastos', 4);
    e = juega(e, 3, 'espadas', 6);
    e = juega(e, 0, 'oros', 12);
    e = juega(e, 1, 'copas', 3);
    e = juega(e, 2, 'bastos', 5);
    e = juega(e, 3, 'espadas', 7);

    expect(e.puntos).toEqual([-2, -1]);
    expect(e.motivoFin).toBe('estructura-completa'); // NO kamikaze-no-declarado
    expect(e.ganadorPartida).toBe(1);
  });

  it('no declarado: el equipo mano con -2 pierde la partida en el acto', () => {
    let e = partida({ manos, estructura: [2, 2], ases: { espadas: false } });
    e = pide(e, 0, 0);
    e = pide(e, 1, 1);
    e = juega(e, 0, 'bastos', 1);
    e = juega(e, 1, 'copas', 2);
    e = juega(e, 2, 'bastos', 4);
    e = juega(e, 3, 'espadas', 6);
    e = juega(e, 0, 'oros', 12);
    e = juega(e, 1, 'copas', 3);
    e = juega(e, 2, 'bastos', 5);
    e = juega(e, 3, 'espadas', 7);

    expect(e.fase).toBe('fin-partida');
    expect(e.motivoFin).toBe('kamikaze-no-declarado');
    expect(e.ganadorPartida).toBe(1);
  });

  it('el pool es único y compartido entre los dos equipos', () => {
    const manoDe1 = [[C('oros', 2)], [C('oros', 3)], [C('oros', 4)], [C('oros', 5)]];
    let e = partida({ manos: manoDe1, estructura: [1, 1], kamikazes: 1 });
    e = declaraKamikaze(e, 0); // declara el equipo 0 (mano)
    expect(e.kamikazesRestantes).toBe(0);
    e = pide(e, 0, 0);
    e = pide(e, 1, 0);
    e = juega(e, 0, 'oros', 2);
    e = juega(e, 1, 'oros', 3);
    e = juega(e, 2, 'oros', 4);
    e = juega(e, 3, 'oros', 5);
    expect(e.fase).toBe('fin-mano');
    expect(e.puntos).toEqual([10, -1]); // cumplió el 0 pedido

    // Mano siguiente: pie rota a 0, jugadorMano=1, equipo mano = 1
    e = gameReducer(e, { type: 'CONTINUAR', manosForzadas: manoDe1 });
    expect(equipoDe(e.jugadorMano)).toBe(1);
    const antes = e;
    e = declaraKamikaze(e, 1);
    expect(e).toBe(antes); // sin kamikazes restantes, la declaración no pasa
  });

  it('no se puede declarar después de que el equipo mano ya pidió', () => {
    let e = partida({ manos, estructura: [2] });
    e = pide(e, 0, 1);
    const antes = e;
    e = declaraKamikaze(e, 0);
    expect(e).toBe(antes);
  });

  it('un jugador que no es el capitán no puede confirmar el pedido ni declarar kamikaze', () => {
    let e = partida({ manos, estructura: [2] });
    const antes = e;
    expect(gameReducer(e, { type: 'DECLARAR_KAMIKAZE', jugador: 2 })).toBe(antes);
    expect(
      gameReducer(e, { type: 'PEDIR', equipo: 0, jugador: 2, valor: 1 }),
    ).toBe(antes);
  });
});

describe('rotación de pie y mano', () => {
  it('con 8 jugadores rota mod 8 (regresión del %6 hardcodeado)', () => {
    const manos8 = [2, 3, 4, 5, 6, 7, 10, 11].map((v) => [C('oros', v)]);
    let e = partida({ nJugadores: 8, estructura: [1, 1, 1], manos: manos8, pie: 6 });
    expect(e.jugadorMano).toBe(7);
    expect(e.turnoPedir).toBe(1); // equipo del jugador 7

    e = pide(e, 1, 0);
    e = pide(e, 0, 0);
    for (const j of [7, 0, 1, 2, 3, 4, 5, 6]) {
      e = juega(e, j, 'oros', [2, 3, 4, 5, 6, 7, 10, 11][j]);
    }
    expect(e.fase).toBe('fin-mano');
    e = gameReducer(e, { type: 'CONTINUAR', manosForzadas: manos8 });
    expect(e.pie).toBe(7);
    expect(e.jugadorMano).toBe(0);

    e = pide(e, 0, 0);
    e = pide(e, 1, 0);
    for (const j of [0, 1, 2, 3, 4, 5, 6, 7]) {
      e = juega(e, j, 'oros', [2, 3, 4, 5, 6, 7, 10, 11][j]);
    }
    e = gameReducer(e, { type: 'CONTINUAR', manosForzadas: manos8 });
    expect(e.pie).toBe(0); // (7+1) % 8, no % 6
    expect(e.jugadorMano).toBe(1);
  });

  it('el sentido se resetea a antihorario en cada mano nueva', () => {
    const manos = [
      [C('copas', 1)],
      [C('oros', 4)],
      [C('oros', 6)],
      [C('oros', 7)],
    ];
    let e = partida({ manos, estructura: [1, 1] });
    e = pide(e, 0, 0);
    e = pide(e, 1, 0);
    e = juega(e, 0, 'copas', 1);
    e = gameReducer(e, { type: 'ELEGIR_SENTIDO', invertir: true });
    expect(e.sentido).toBe(-1);
    expect(e.turno).toBe(3); // la ronda sigue al revés
    e = juega(e, 3, 'oros', 7);
    e = juega(e, 2, 'oros', 6);
    e = juega(e, 1, 'oros', 4);
    expect(e.fase).toBe('fin-mano');
    e = gameReducer(e, { type: 'CONTINUAR', manosForzadas: manos });
    expect(e.sentido).toBe(1);
  });
});

describe('reparto real (sin manos forzadas)', () => {
  it('reparte manos del tamaño de la estructura, sin cartas repetidas, determinístico por semilla', () => {
    let e = gameReducer(estadoInicial(), {
      type: 'INICIAR_PARTIDA',
      config: { nJugadores: 6, estructura: 'postpandemia', semilla: 123 },
    });
    e = gameReducer(e, { type: 'SORTEAR' });
    expect(e.fase).toBe('pedir');
    expect(e.pie).toBeGreaterThanOrEqual(0);
    expect(e.pie).toBeLessThan(6);
    expect(e.manos).toHaveLength(6);
    for (const mano of e.manos) expect(mano).toHaveLength(1); // postpandemia arranca en 1
    const ids = e.manos.flat().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    let e2 = gameReducer(estadoInicial(), {
      type: 'INICIAR_PARTIDA',
      config: { nJugadores: 6, estructura: 'postpandemia', semilla: 123 },
    });
    e2 = gameReducer(e2, { type: 'SORTEAR' });
    expect(e2.pie).toBe(e.pie);
    expect(e2.manos).toEqual(e.manos);
  });
});

describe('acciones inválidas no cambian el estado', () => {
  const manos = [
    [C('oros', 2), C('copas', 2)],
    [C('oros', 4), C('copas', 4)],
    [C('oros', 6), C('copas', 6)],
    [C('oros', 7), C('copas', 7)],
  ];

  it('pedir fuera de turno o con valor ilegal', () => {
    let e = partida({ manos, estructura: [2] });
    expect(pide(e, 1, 0)).toBe(e); // le toca al equipo 0
    expect(pide(e, 0, 3)).toBe(e); // total es 2, el 3 no existe
    expect(pide(e, 0, -1)).toBe(e);
    expect(pide(e, 0, 2)).not.toBe(e); // un pedido válido sí avanza
  });

  it('jugar fuera de turno, carta ajena, o durante una elección', () => {
    let e = partida({ manos, estructura: [2] });
    e = pide(e, 0, 1);
    e = pide(e, 1, 0);
    expect(juega(e, 1, 'oros', 4)).toBe(e); // turno de 0
    expect(juega(e, 0, 'oros', 4)).toBe(e); // esa carta es de P1
    const conCopas = [
      [C('copas', 1), C('oros', 2)],
      [C('oros', 4), C('copas', 4)],
      [C('oros', 6), C('copas', 6)],
      [C('oros', 7), C('copas', 7)],
    ];
    let e2 = partida({ manos: conCopas, estructura: [2] });
    e2 = pide(e2, 0, 1);
    e2 = pide(e2, 1, 0);
    e2 = juega(e2, 0, 'copas', 1);
    expect(e2.fase).toBe('elegir-sentido');
    expect(juega(e2, 1, 'oros', 4)).toBe(e2); // bloqueado hasta elegir
  });
});

describe('tiempo', () => {
  const manos = [[C('oros', 2)], [C('oros', 4)], [C('oros', 6)], [C('oros', 7)]];

  it('muerte súbita: quedarse sin tiempo pierde la partida', () => {
    let e = partida({ manos, estructura: [1], tiempo: { minutos: 5, modo: 'muerte' } });
    e = gameReducer(e, { type: 'TIEMPO_AGOTADO', equipo: 0 });
    expect(e.fase).toBe('fin-partida');
    expect(e.ganadorPartida).toBe(1);
    expect(e.motivoFin).toBe('tiempo');
  });

  it('deportivo: marca el modo rápido del equipo y se sigue jugando', () => {
    let e = partida({ manos, estructura: [1], tiempo: { minutos: 5, modo: 'deportivo' } });
    e = gameReducer(e, { type: 'TIEMPO_AGOTADO', equipo: 1 });
    expect(e.fase).toBe('pedir');
    expect(e.modoRapido).toEqual([false, true]);
  });

  it('sin reloj configurado, el evento se ignora', () => {
    let e = partida({ manos, estructura: [1] });
    expect(gameReducer(e, { type: 'TIEMPO_AGOTADO', equipo: 0 })).toBe(e);
  });
});

describe('empate y reinicio', () => {
  it('puntos iguales al final → empate', () => {
    // Total 1 y primer pedido 1 → el segundo equipo queda obligado a pedir 1 (suma 2 = total+1).
    const manos = [[C('oros', 12)], [C('oros', 4)], [C('oros', 6)], [C('oros', 7)]];
    let e = partida({ manos, estructura: [1, 1] });
    e = pide(e, 0, 1);
    e = pide(e, 1, 1);
    for (const j of [0, 1, 2, 3]) e = juega(e, j, 'oros', [12, 4, 6, 7][j]);
    expect(e.puntos).toEqual([11, -1]); // ganó la base el equipo 0

    // Mano 2 espejada: pie=0, jugadorMano=1, y ahora la base la gana el equipo 1.
    const manos2 = [[C('oros', 4)], [C('oros', 12)], [C('oros', 6)], [C('oros', 7)]];
    e = gameReducer(e, { type: 'CONTINUAR', manosForzadas: manos2 });
    expect(equipoDe(e.jugadorMano)).toBe(1);
    e = pide(e, 1, 1);
    e = pide(e, 0, 1);
    for (const j of [1, 2, 3, 0]) e = juega(e, j, 'oros', [4, 12, 6, 7][j]);
    expect(e.fase).toBe('fin-partida');
    expect(e.puntos).toEqual([10, 10]);
    expect(e.ganadorPartida).toBe('empate');
  });

  it('REINICIAR vuelve a la config conservándola', () => {
    const manos = [[C('oros', 2)], [C('oros', 4)], [C('oros', 6)], [C('oros', 7)]];
    let e = partida({ manos, estructura: [1] });
    e = gameReducer(e, { type: 'REINICIAR' });
    expect(e.fase).toBe('config');
    expect(e.config.nJugadores).toBe(4);
  });
});
