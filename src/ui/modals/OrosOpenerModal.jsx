import { useGame } from '../../state/useGame.js';
import { nombreDe } from '../../state/selectors.js';

export default function OrosOpenerModal() {
  const { estado, dispatch } = useGame();
  return (
    <section>
      <h2>As de Oros</h2>
      <p>{nombreDe(estado, estado.pendienteOros)} elige quién abre la próxima base:</p>
      {estado.config.nombres.map((nombre, jugador) => (
        <button
          key={jugador}
          type="button"
          onClick={() => dispatch({ type: 'ELEGIR_ABRIDOR', jugador })}
        >
          {nombre}
        </button>
      ))}
    </section>
  );
}
