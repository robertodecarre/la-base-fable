// Orden normal: 12 > 11 > 10 > 7 > 6 > 5 > 4 > 3 > 2 > 1
const RANGO = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 10: 8, 11: 9, 12: 10 };

export const JERARQUIA_ANCHO = 100;

export const esAncho = (carta) => carta.palo === 'bastos' && carta.valor === 1;
export const esAsEspadas = (carta) => carta.palo === 'espadas' && carta.valor === 1;
export const esAsCopas = (carta) => carta.palo === 'copas' && carta.valor === 1;
export const esAsOros = (carta) => carta.palo === 'oros' && carta.valor === 1;

export function jerarquia(carta) {
  return esAncho(carta) ? JERARQUIA_ANCHO : RANGO[carta.valor];
}
