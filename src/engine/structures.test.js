import { describe, it, expect } from 'vitest';
import { ESTRUCTURAS, maxCartas, estructuraEfectiva } from './structures.js';

describe('estructuras', () => {
  it('contiene las tres estructuras con sus arrays exactos', () => {
    expect(ESTRUCTURAS.clasica2004).toEqual([1, 3, 5, 5, 3, 1, 1, 3, 5, 5, 3, 1]);
    expect(ESTRUCTURAS.alt2004).toEqual([1, 3, 5, 6, 6, 5, 3, 1, 1, 3, 5, 6, 6, 5, 3, 1]);
    expect(ESTRUCTURAS.postpandemia).toEqual([1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1]);
  });
});

describe('maxCartas', () => {
  it('4j→7, 6j→6, 8j un mazo→5, 8j dos mazos→7', () => {
    expect(maxCartas(4)).toBe(7);
    expect(maxCartas(6)).toBe(6);
    expect(maxCartas(8, false)).toBe(5);
    expect(maxCartas(8, true)).toBe(7);
  });
});

describe('estructuraEfectiva', () => {
  it('recorta las manos que exceden el máximo repartible', () => {
    expect(estructuraEfectiva('alt2004', 8, false)).toEqual(
      [1, 3, 5, 5, 5, 5, 3, 1, 1, 3, 5, 5, 5, 5, 3, 1],
    );
  });

  it('no toca estructuras que ya caben', () => {
    expect(estructuraEfectiva('clasica2004', 4, false)).toEqual(ESTRUCTURAS.clasica2004);
  });

  it('acepta un array custom', () => {
    expect(estructuraEfectiva([2, 9], 4, false)).toEqual([2, 7]);
  });
});
