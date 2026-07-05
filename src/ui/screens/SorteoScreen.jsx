import { useGame } from '../../state/useGame.js';

export default function SorteoScreen() {
  const { dispatch } = useGame();
  return (
    <section>
      <h1>Sorteo</h1>
      <p>Se va a elegir al azar quién reparte primero (&quot;pie&quot;).</p>
      <button type="button" onClick={() => dispatch({ type: 'SORTEAR' })}>
        Sortear y repartir
      </button>
    </section>
  );
}
