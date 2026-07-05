// Opciones del primer equipo en pedir (el equipo mano).
// Con kamikaze declarado: todo o nada (0 o el total exacto).
export function opcionesPrimerPedido(total, kamikaze = false) {
  if (kamikaze) return total === 0 ? [0] : [0, total];
  return Array.from({ length: total + 1 }, (_, i) => i);
}

// La suma de ambos pedidos debe ser total±1 (nunca el total exacto).
export function opcionesValidas(primerPedido, total) {
  return [total - 1 - primerPedido, total + 1 - primerPedido].filter(
    (v) => v >= 0 && v <= total,
  );
}
