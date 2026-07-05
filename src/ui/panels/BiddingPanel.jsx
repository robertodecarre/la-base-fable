import { useGame } from '../../state/useGame.js';
import { opcionesDePedido, capitanDe, nombreDe, equipoManoActual } from '../../state/selectors.js';

export default function BiddingPanel() {
  const { estado, dispatch } = useGame();
  const equipo = estado.turnoPedir;
  const otro = 1 - equipo;
  const capitan = capitanDe(estado, equipo);
  const opciones = opcionesDePedido(estado);
  const puedeKamikaze =
    equipo === equipoManoActual(estado) &&
    estado.kamikazeDeclarado === null &&
    estado.kamikazesRestantes > 0;

  return (
    <section>
      <h2>Pedir bases (total: {estado.nBases})</h2>
      <p>
        Le toca pedir a <strong>{equipo === 0 ? 'Nosotros' : 'Ellos'}</strong> — capitán:{' '}
        {nombreDe(estado, capitan)}
      </p>
      {estado.pedidos[otro] !== null && (
        <p>
          {otro === 0 ? 'Nosotros' : 'Ellos'} ya pidió {estado.pedidos[otro]}.
        </p>
      )}
      {estado.kamikazeDeclarado !== null && (
        <p>Kamikaze declarado por {estado.kamikazeDeclarado === 0 ? 'Nosotros' : 'Ellos'}.</p>
      )}
      <div>
        {opciones.map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => dispatch({ type: 'PEDIR', equipo, jugador: capitan, valor })}
          >
            {valor}
          </button>
        ))}
      </div>
      {puedeKamikaze && (
        <button
          type="button"
          onClick={() => dispatch({ type: 'DECLARAR_KAMIKAZE', jugador: capitan })}
        >
          Declarar kamikaze ({estado.kamikazesRestantes} disponibles)
        </button>
      )}
    </section>
  );
}
