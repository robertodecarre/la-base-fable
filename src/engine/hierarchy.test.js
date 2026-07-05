import { describe, it, expect } from 'vitest';
import { jerarquia, esAncho, esAsEspadas, JERARQUIA_ANCHO } from './hierarchy.js';

const C = (palo, valor) => ({ palo, valor, mazo: 0, id: `${palo}-${valor}-0` });

describe('jerarquia', () => {
  it('respeta el orden 12 > 11 > 10 > 7 > 6 > 5 > 4 > 3 > 2 > 1', () => {
    const orden = [12, 11, 10, 7, 6, 5, 4, 3, 2, 1].map((v) => jerarquia(C('oros', v)));
    for (let i = 1; i < orden.length; i++) {
      expect(orden[i - 1]).toBeGreaterThan(orden[i]);
    }
  });

  it('el Ancho de Bastos vale más que todo', () => {
    expect(jerarquia(C('bastos', 1))).toBe(JERARQUIA_ANCHO);
    expect(jerarquia(C('bastos', 1))).toBeGreaterThan(jerarquia(C('oros', 12)));
  });

  it('los otros ases valen 1 (jerarquía mínima)', () => {
    for (const palo of ['oros', 'copas', 'espadas']) {
      expect(jerarquia(C(palo, 1))).toBe(1);
    }
  });

  it('identifica al Ancho y al As de Espadas por palo y valor', () => {
    expect(esAncho(C('bastos', 1))).toBe(true);
    expect(esAncho(C('oros', 1))).toBe(false);
    expect(esAncho(C('bastos', 2))).toBe(false);
    expect(esAsEspadas(C('espadas', 1))).toBe(true);
    expect(esAsEspadas(C('espadas', 7))).toBe(false);
  });
});
