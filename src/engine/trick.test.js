import { describe, it, expect } from 'vitest';
import { resolverBase } from './trick.js';

const C = (palo, valor, mazo = 0) => ({ palo, valor, mazo, id: `${palo}-${valor}-${mazo}` });
const J = (jugador, palo, valor, mazo = 0) => ({ jugador, carta: C(palo, valor, mazo) });

describe('resolverBase', () => {
  it('gana la jerarquía más alta (el 10 le gana al 7)', () => {
    const r = resolverBase([J(0, 'oros', 7), J(1, 'copas', 10), J(2, 'espadas', 4)]);
    expect(r.ganador).toBe(1);
    expect(r.motivo).toBe('jerarquia');
  });

  it('el Ancho de Bastos le gana al 12', () => {
    const r = resolverBase([J(0, 'oros', 12), J(1, 'bastos', 1), J(2, 'copas', 12)]);
    expect(r.ganador).toBe(1);
  });

  it('el As de Espadas mata al Ancho si se juega después', () => {
    const r = resolverBase([J(0, 'bastos', 1), J(1, 'espadas', 1), J(2, 'oros', 12)]);
    expect(r.ganador).toBe(1);
    expect(r.motivo).toBe('espadas-mata-ancho');
  });

  it('el As de Espadas jugado antes del Ancho no hace nada', () => {
    const r = resolverBase([J(0, 'espadas', 1), J(1, 'bastos', 1), J(2, 'oros', 12)]);
    expect(r.ganador).toBe(1);
    expect(r.motivo).toBe('jerarquia');
  });

  it('sin Ancho en la base, el As de Espadas es la carta más baja', () => {
    const r = resolverBase([J(0, 'espadas', 1), J(1, 'oros', 2)]);
    expect(r.ganador).toBe(1);
  });

  it('con el superpoder de espadas desactivado, el Ancho gana igual', () => {
    const r = resolverBase(
      [J(0, 'bastos', 1), J(1, 'espadas', 1), J(2, 'oros', 12)],
      { espadas: false },
    );
    expect(r.ganador).toBe(0);
  });

  it('empate de jerarquía (dos mazos): gana quien jugó primero', () => {
    const r = resolverBase([J(0, 'oros', 5), J(1, 'copas', 12, 0), J(2, 'copas', 12, 1)]);
    expect(r.ganador).toBe(1);
  });
});
