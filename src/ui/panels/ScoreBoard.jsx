export default function ScoreBoard({ historial, puntos }) {
  return (
    <section>
      <h2>Puntaje</h2>
      <p>
        Nosotros: {puntos[0]} — Ellos: {puntos[1]}
      </p>
      {historial.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Mano</th>
              <th>Pedido N</th>
              <th>Hecho N</th>
              <th>Pedido E</th>
              <th>Hecho E</th>
              <th>&Delta; N</th>
              <th>&Delta; E</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.indiceMano}>
                <td>{h.indiceMano + 1}</td>
                <td>{h.pedidos[0]}</td>
                <td>{h.hechos[0]}</td>
                <td>{h.pedidos[1]}</td>
                <td>{h.hechos[1]}</td>
                <td>{h.deltas[0]}</td>
                <td>{h.deltas[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
