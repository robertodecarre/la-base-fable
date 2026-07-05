import { jerarquia, esAncho, esAsEspadas } from './hierarchy.js';

// jugadas: [{ jugador, carta }] en orden cronológico de juego.
// El As de Espadas mata al Ancho solo si se juega después de él en la misma base.
// Empate de jerarquía: gana quien jugó primero.
export function resolverBase(jugadas, ases = { espadas: true }) {
  if (ases.espadas) {
    const iAncho = jugadas.findIndex((j) => esAncho(j.carta));
    if (iAncho >= 0) {
      const iEspadas = jugadas.findIndex((j, i) => i > iAncho && esAsEspadas(j.carta));
      if (iEspadas >= 0) {
        return { indice: iEspadas, ganador: jugadas[iEspadas].jugador, motivo: 'espadas-mata-ancho' };
      }
    }
  }
  let mejor = 0;
  for (let i = 1; i < jugadas.length; i++) {
    if (jerarquia(jugadas[i].carta) > jerarquia(jugadas[mejor].carta)) mejor = i;
  }
  return { indice: mejor, ganador: jugadas[mejor].jugador, motivo: 'jerarquia' };
}
