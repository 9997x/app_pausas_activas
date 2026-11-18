/**
 * Cliente de la API Node.js/Express. Es la MISMA API que usa la app Android
 * (ver RetrofitClient.kt), por eso todo lo que se hace aquí se ve en el móvil y viceversa.
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). Verifica que la API esté encendida (node index.js).`
    );
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // respuesta sin JSON
  }

  if (!response.ok) {
    throw new Error(body?.mensaje || `El servidor respondió con un error (código ${response.status}).`);
  }
  return body;
}

/** Acceso de demo: busca al usuario por su correo institucional (sin contraseña). */
export async function login(correo) {
  const body = await request(`/api/usuarios/buscar?correo=${encodeURIComponent(correo)}`);
  return body.datos;
}

export async function register({ correo, nombre, carrera }) {
  const body = await request('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify({ correo, nombre, carrera: carrera || undefined })
  });
  return body.datos;
}

/**
 * Historial del usuario. Filtros opcionales:
 *  - desde / hasta: objetos Date (rango de fecha_registro)
 *  - ejercicio: código del ejercicio (p. ej. CUELLO_LATERAL)
 */
export async function getSessions(usuarioId, { desde, hasta, ejercicio } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde.toISOString());
  if (hasta) params.set('hasta', hasta.toISOString());
  if (ejercicio) params.set('ejercicio', ejercicio);
  const query = params.toString() ? `?${params}` : '';
  const body = await request(`/api/sesiones/usuario/${encodeURIComponent(usuarioId)}${query}`);
  return body.datos || [];
}

export async function deleteSession(sesionId) {
  await request(`/api/sesiones/${encodeURIComponent(sesionId)}`, { method: 'DELETE' });
}
