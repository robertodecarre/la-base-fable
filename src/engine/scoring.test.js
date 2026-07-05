import { describe, it, expect } from 'vitest';
import { puntajeMano, esKamikazeNoDeclarado } from './scoring.js';

describe('puntajeMano', () => {
  it('cumplir exacto suma 10 + hecho; fallar resta la diferencia', () => {
    expect(puntajeMano([2, 4], [2, 3])).toEqual([12, -1]);
    expect(puntajeMano([3, 1], [1, 4])).toEqual([-2, -3]);
  });

  it('pedir 0 y cumplir vale 10 justos', () => {
    expect(puntajeMano([0, 4], [0, 5])).toEqual([10, -1]);
  });

  it('cumplir el total entero paga 10 + total', () => {
    expect(puntajeMano([5, 1], [5, 0])).toEqual([15, -1]);
  });
});

describe('esKamikazeNoDeclarado', () => {
  it('se dispara con delta -2 o peor sin declaración', () => {
    expect(esKamikazeNoDeclarado(-2, false)).toBe(true);
    expect(esKamikazeNoDeclarado(-5, false)).toBe(true);
  });

  it('no se dispara con -1, con 0 ni habiendo declarado', () => {
    expect(esKamikazeNoDeclarado(-1, false)).toBe(false);
    expect(esKamikazeNoDeclarado(12, false)).toBe(false);
    expect(esKamikazeNoDeclarado(-2, true)).toBe(false);
  });
});
