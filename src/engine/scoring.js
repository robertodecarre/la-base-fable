// pedidos y hechos son arrays por equipo: [equipo0, equipo1].
// Cumplir exacto: +10 + hecho. Fallar: -|hecho - pedido|.
export function puntajeMano(pedidos, hechos) {
  return pedidos.map((pedido, i) =>
    hechos[i] === pedido ? 10 + hechos[i] : -Math.abs(hechos[i] - pedido),
  );
}

// Regla de kamikaze no declarado: aplica solo al equipo mano.
export function esKamikazeNoDeclarado(delta, declaroKamikaze) {
  return !declaroKamikaze && delta <= -2;
}
