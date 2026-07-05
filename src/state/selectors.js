import { equipoDe, opcionesDePedido } from '../engine/game.js';

export { equipoDe, opcionesDePedido };

export const capitanDe = (estado, equipo) => estado.config.capitanes[equipo];

export const esCapitan = (estado, jugador) =>
  estado.config.capitanes[equipoDe(jugador)] === jugador;

export const nombreDe = (estado, jugador) => estado.config.nombres[jugador];

export const jugadorEnTurno = (estado) => (estado.fase === 'jugar' ? estado.turno : null);

export const puedeJugar = (estado, jugador) =>
  estado.fase === 'jugar' && estado.turno === jugador;

export const equipoManoActual = (estado) => equipoDe(estado.jugadorMano);
