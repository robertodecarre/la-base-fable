import { etiquetaCarta } from '../cards/cardLabel.js';

export default function TrickArea({ baseActual, nombres }) {
  return (
    <div>
      <h3>Base actual</h3>
      {baseActual.length === 0 ? (
        <p>(nadie tiró todavía)</p>
      ) : (
        <ol>
          {baseActual.map(({ jugador, carta }) => (
            <li key={carta.id}>
              {nombres[jugador]}: {etiquetaCarta(carta)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
