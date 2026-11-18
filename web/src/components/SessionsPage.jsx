import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteSession, getSessions } from '../api.js';
import { endOfDay, startOfDay, todayInput } from '../dates.js';
import { EXERCISES } from '../exercises.js';
import SessionCard from './SessionCard.jsx';

/** Cada cuánto se vuelve a consultar la API para ver las sesiones nuevas hechas desde el móvil. */
const AUTO_REFRESH_MS = 20000;

export default function SessionsPage({ user, onLogout }) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [ejercicio, setEjercicio] = useState('');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState(null);

  // Evita que una respuesta vieja pise a una más reciente si los filtros cambian rápido.
  const requestIdRef = useRef(0);

  const rangeError = desde && hasta && desde > hasta
    ? 'La fecha "desde" no puede ser posterior a la fecha "hasta".'
    : null;

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (rangeError) return;
      const requestId = ++requestIdRef.current;
      if (!silent) setLoading(true);
      try {
        const data = await getSessions(user.id, {
          desde: startOfDay(desde),
          hasta: endOfDay(hasta),
          ejercicio: ejercicio || undefined
        });
        if (requestId === requestIdRef.current) {
          setSessions(data);
          setError(null);
        }
      } catch (e) {
        if (requestId === requestIdRef.current) setError(e.message);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [user.id, desde, hasta, ejercicio, rangeError]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Sincronización con el móvil: refresco periódico y al volver a la pestaña.
  useEffect(() => {
    const interval = setInterval(() => load({ silent: true }), AUTO_REFRESH_MS);
    const onFocus = () => load({ silent: true });
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const handleDelete = async (session) => {
    const ok = window.confirm(
      `¿Eliminar la pausa "${session.ejercicio?.nombre ?? 'sin nombre'}"? ` +
        'También desaparecerá de la app móvil. Esta acción no se puede deshacer.'
    );
    if (!ok) return;

    setDeletingId(session._id);
    try {
      await deleteSession(session._id);
      setSessions((prev) => prev.filter((s) => s._id !== session._id));
      setNotice('Pausa eliminada.');
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const setToday = () => {
    const today = todayInput();
    setDesde(today);
    setHasta(today);
  };

  const clearFilters = () => {
    setDesde('');
    setHasta('');
    setEjercicio('');
  };

  const total = sessions.length;
  const validas = sessions.filter((s) => s.telemetria_ia?.postura_valida).length;
  const precisionPromedio = total
    ? Math.round(
        sessions.reduce((acc, s) => acc + (s.telemetria_ia?.precision_promedio_pct ?? 0), 0) / total
      )
    : 0;
  const hasFilters = Boolean(desde || hasta || ejercicio);

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Mis pausas activas</h1>
          <p className="muted">
            {user.nombre || 'Usuario'} · {user.correo}
          </p>
        </div>
        <button type="button" className="secondary" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      <section className="card filters" aria-label="Filtros de búsqueda">
        <label>
          Desde
          <input type="date" value={desde} max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
        </label>
        <label>
          Ejercicio
          <select value={ejercicio} onChange={(e) => setEjercicio(e.target.value)}>
            <option value="">Todos</option>
            {EXERCISES.map((ex) => (
              <option key={ex.codigo} value={ex.codigo}>
                {ex.nombre} ({ex.zona})
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <button type="button" className="secondary" onClick={setToday}>
            Hoy
          </button>
          <button type="button" className="secondary" onClick={clearFilters} disabled={!hasFilters}>
            Limpiar
          </button>
          <button type="button" className="primary" onClick={() => load()} disabled={loading}>
            Actualizar
          </button>
        </div>
      </section>

      {rangeError && <p className="error">{rangeError}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="notice">{notice}</p>}

      <section className="stats">
        <div className="stat">
          <span className="stat-value">{total}</span>
          <span className="muted">{hasFilters ? 'sesiones encontradas' : 'sesiones en total'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{validas}</span>
          <span className="muted">con postura válida</span>
        </div>
        <div className="stat">
          <span className="stat-value">{precisionPromedio} %</span>
          <span className="muted">precisión promedio</span>
        </div>
      </section>

      {loading ? (
        <p className="muted center">Cargando sesiones…</p>
      ) : sessions.length === 0 ? (
        <p className="muted center">
          {hasFilters
            ? 'No hay sesiones que coincidan con la búsqueda.'
            : 'Aún no tienes sesiones guardadas. Completa un ejercicio en la app móvil para verlo aquí.'}
        </p>
      ) : (
        <ul className="session-list">
          {sessions.map((s) => (
            <SessionCard
              key={s._id}
              session={s}
              deleting={deletingId === s._id}
              onDelete={() => handleDelete(s)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
