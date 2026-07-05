import Card from '../cards/Card.jsx';

export default function PlayerHand({ nombre, mano, activo, onJugar }) {
  return (
    <div>
      <strong>
        {activo ? '➤ ' : ''}
        {nombre}
      </strong>
      <div>
        {mano.map((carta) => (
          <Card
            key={carta.id}
            carta={carta}
            disabled={!activo}
            onClick={activo ? () => onJugar(carta.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
