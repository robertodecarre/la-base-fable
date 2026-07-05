import { etiquetaCarta } from './cardLabel.js';

// Placeholder textual — el diseño SVG hand-drawn se agrega en la fase 3,
// sin cambiar la interfaz de este componente.
export default function Card({ carta, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || !onClick}>
      {etiquetaCarta(carta)}
    </button>
  );
}
