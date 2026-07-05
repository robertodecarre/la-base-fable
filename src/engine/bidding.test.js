import { describe, it, expect } from 'vitest';
import { opcionesPrimerPedido, opcionesValidas } from './bidding.js';

describe('opcionesPrimerPedido', () => {
  it('sin kamikaze: cualquier valor de 0 al total', () => {
    expect(opcionesPrimerPedido(5)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(opcionesPrimerPedido(1)).toEqual([0, 1]);
  });

  it('con kamikaze: solo 0 o el total exacto', () => {
    expect(opcionesPrimerPedido(5, true)).toEqual([0, 5]);
    expect(opcionesPrimerPedido(1, true)).toEqual([0, 1]);
  });
});

describe('opcionesValidas (la suma debe ser total±1)', () => {
  it('casos puntuales', () => {
    expect(opcionesValidas(2, 5)).toEqual([2, 4]); // 2+2=4, 2+4=6
    expect(opcionesValidas(0, 5)).toEqual([4]); // 6 excede el total
    expect(opcionesValidas(5, 5)).toEqual([1]); // -1 no existe
    expect(opcionesValidas(0, 1)).toEqual([0]);
    expect(opcionesValidas(1, 1)).toEqual([1]);
  });

  it('toda opción deja la suma en total±1 y siempre hay al menos una', () => {
    for (let total = 1; total <= 7; total++) {
      for (let primero = 0; primero <= total; primero++) {
        const opciones = opcionesValidas(primero, total);
        expect(opciones.length).toBeGreaterThan(0);
        for (const v of opciones) {
          expect(Math.abs(primero + v - total)).toBe(1);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(total);
        }
      }
    }
  });
});
