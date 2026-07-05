const NOMBRES_VALOR = { 1: 'As', 10: 'Sota', 11: 'Caballo', 12: 'Rey' };
const NOMBRES_PALO = { oros: 'Oros', copas: 'Copas', espadas: 'Espadas', bastos: 'Bastos' };

export function etiquetaCarta(carta) {
  const valor = NOMBRES_VALOR[carta.valor] ?? carta.valor;
  return `${valor} de ${NOMBRES_PALO[carta.palo]}`;
}
