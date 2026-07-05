import { useState } from 'react';
import { useGame } from '../../state/useGame.js';
import { NOMBRES_DEFAULT } from '../../engine/constants.js';
import { ESTRUCTURAS } from '../../engine/structures.js';

export default function ConfigScreen() {
  const { dispatch } = useGame();
  const [nJugadores, setNJugadores] = useState(4);
  const [nombres, setNombres] = useState(NOMBRES_DEFAULT.slice(0, 4));
  const [estructura, setEstructura] = useState('clasica2004');
  const [dosMazos, setDosMazos] = useState(false);
  const [kamikazes, setKamikazes] = useState(1);
  const [ases, setAses] = useState({ espadas: true, copas: true, oros: true });
  const [capitanes, setCapitanes] = useState([0, 1]);

  function cambiarNJugadores(n) {
    setNJugadores(n);
    setNombres(NOMBRES_DEFAULT.slice(0, n));
    setCapitanes([0, 1]);
    if (n !== 8) setDosMazos(false);
  }

  function cambiarNombre(i, valor) {
    setNombres((prev) => prev.map((nom, idx) => (idx === i ? valor : nom)));
  }

  function iniciar() {
    dispatch({
      type: 'INICIAR_PARTIDA',
      config: { nJugadores, nombres, estructura, dosMazos, kamikazes, ases, capitanes },
    });
  }

  const indices = nombres.map((_, i) => i);
  const equipo0 = indices.filter((i) => i % 2 === 0);
  const equipo1 = indices.filter((i) => i % 2 === 1);

  return (
    <section>
      <h1>La Base — Configuración</h1>

      <fieldset>
        <legend>Jugadores</legend>
        <label>
          Cantidad:{' '}
          <select
            value={nJugadores}
            onChange={(e) => cambiarNJugadores(Number(e.target.value))}
          >
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
        </label>
        <ul>
          {nombres.map((nombre, i) => (
            <li key={i}>
              Jugador {i} ({i % 2 === 0 ? 'Nosotros' : 'Ellos'}):{' '}
              <input value={nombre} onChange={(e) => cambiarNombre(i, e.target.value)} />
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend>Reglas</legend>
        <label>
          Estructura:{' '}
          <select value={estructura} onChange={(e) => setEstructura(e.target.value)}>
            {Object.keys(ESTRUCTURAS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <br />
        {nJugadores === 8 && (
          <label>
            <input
              type="checkbox"
              checked={dosMazos}
              onChange={(e) => setDosMazos(e.target.checked)}
            />
            Dos mazos
          </label>
        )}
        <br />
        <label>
          Kamikazes disponibles:{' '}
          <input
            type="number"
            min={0}
            value={kamikazes}
            onChange={(e) => setKamikazes(Number(e.target.value))}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Superpoderes de los ases</legend>
        <p>As de Bastos (Ancho): siempre activo</p>
        <label>
          <input
            type="checkbox"
            checked={ases.espadas}
            onChange={(e) => setAses((a) => ({ ...a, espadas: e.target.checked }))}
          />
          As de Espadas (mata al Ancho)
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={ases.copas}
            onChange={(e) => setAses((a) => ({ ...a, copas: e.target.checked }))}
          />
          As de Copas (invierte el sentido)
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={ases.oros}
            onChange={(e) => setAses((a) => ({ ...a, oros: e.target.checked }))}
          />
          As de Oros (elige quién abre)
        </label>
      </fieldset>

      <fieldset>
        <legend>Capitanes (confirman los pedidos)</legend>
        <label>
          Nosotros:{' '}
          <select
            value={capitanes[0]}
            onChange={(e) => setCapitanes([Number(e.target.value), capitanes[1]])}
          >
            {equipo0.map((i) => (
              <option key={i} value={i}>
                {nombres[i]}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Ellos:{' '}
          <select
            value={capitanes[1]}
            onChange={(e) => setCapitanes([capitanes[0], Number(e.target.value)])}
          >
            {equipo1.map((i) => (
              <option key={i} value={i}>
                {nombres[i]}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <button type="button" onClick={iniciar}>
        Empezar partida
      </button>
    </section>
  );
}
