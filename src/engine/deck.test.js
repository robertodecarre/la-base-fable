import { describe, it, expect } from 'vitest';
import { crearMazo, mezclar, repartir, mulberry32 } from './deck.js';

describe('crearMazo', () => {
  it('un mazo tiene 40 cartas, 10 por palo, sin 8 ni 9', () => {
    const mazo = crearMazo();
    expect(mazo).toHaveLength(40);
    for (const palo of ['oros', 'copas', 'espadas', 'bastos']) {
      expect(mazo.filter((c) => c.palo === palo)).toHaveLength(10);
    }
    expect(mazo.some((c) => c.valor === 8 || c.valor === 9)).toBe(false);
  });

  it('dos mazos: 76 cartas y el segundo mazo sin ases', () => {
    const mazo = crearMazo(true);
    expect(mazo).toHaveLength(76);
    const segundo = mazo.filter((c) => c.mazo === 1);
    expect(segundo).toHaveLength(36);
    expect(segundo.some((c) => c.valor === 1)).toBe(false);
  });

  it('todos los ids son únicos', () => {
    const mazo = crearMazo(true);
    expect(new Set(mazo.map((c) => c.id)).size).toBe(mazo.length);
  });
});

describe('mezclar', () => {
  it('es determinístico con la misma semilla', () => {
    const a = mezclar(crearMazo(), mulberry32(7)).map((c) => c.id);
    const b = mezclar(crearMazo(), mulberry32(7)).map((c) => c.id);
    expect(a).toEqual(b);
  });

  it('produce órdenes distintos con semillas distintas', () => {
    const a = mezclar(crearMazo(), mulberry32(1)).map((c) => c.id);
    const b = mezclar(crearMazo(), mulberry32(2)).map((c) => c.id);
    expect(a).not.toEqual(b);
  });

  it('conserva exactamente las mismas cartas', () => {
    const mazo = crearMazo();
    const mezclado = mezclar(mazo, mulberry32(3));
    expect([...mezclado.map((c) => c.id)].sort()).toEqual(
      [...mazo.map((c) => c.id)].sort(),
    );
  });
});

describe('repartir', () => {
  it('da la cantidad justa de cartas a cada jugador, sin repetidas', () => {
    const manos = repartir(mezclar(crearMazo(), mulberry32(5)), 6, 6);
    expect(manos).toHaveLength(6);
    for (const mano of manos) expect(mano).toHaveLength(6);
    const ids = manos.flat().map((c) => c.id);
    expect(new Set(ids).size).toBe(36);
  });
});
