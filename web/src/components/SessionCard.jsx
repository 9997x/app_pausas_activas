import { formatDate } from '../dates.js';

export default function SessionCard({ session, deleting, onDelete }) {
  const telemetry = session.telemetria_ia ?? {};
  const precision = telemetry.precision_promedio_pct;
  const valid = telemetry.postura_valida === true;
  const errors = telemetry.metricas_error ?? [];

  return (
    <li className="card session">
      <div className="session-head">
        <div>
          <h2>{session.ejercicio?.nombre ?? 'Ejercicio sin nombre'}</h2>
          <p className="muted small">{formatDate(session.fecha_registro)}</p>
        </div>
        <span className={`badge ${valid ? 'ok' : 'warn'}`}>{valid ? 'Postura válida' : 'Por mejorar'}</span>
      </div>

      <p>
        Precisión de postura: <strong>{precision != null ? `${Math.round(precision)} %` : 'no disponible'}</strong>
      </p>

      {errors.length > 0 && (
        <ul className="errors small">
          {errors.map((err, i) => (
            <li key={i}>
              {err.articulacion_falla ?? 'Articulación'}: {Math.round(err.angulo_detectado ?? 0)}° detectado
              (esperado {Math.round(err.angulo_esperado ?? 0)}°)
            </li>
          ))}
        </ul>
      )}

      {session.notas_usuario && <p className="small muted">Notas: {session.notas_usuario}</p>}

      <div className="session-actions">
        <button type="button" className="danger" onClick={onDelete} disabled={deleting}>
          {deleting ? 'Eliminando…' : 'Eliminar pausa'}
        </button>
      </div>
    </li>
  );
}
