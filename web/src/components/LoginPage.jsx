import { useState } from 'react';
import { login, register, API_URL } from '../api.js';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@uniautonoma\.edu\.co$/;

export default function LoginPage({ onLogin }) {
  const [registerMode, setRegisterMode] = useState(false);
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = correo.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      setError('Usa tu correo institucional (termina en @uniautonoma.edu.co).');
      return;
    }
    if (registerMode && !nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = registerMode
        ? await register({ correo: email, nombre: nombre.trim(), carrera: carrera.trim() })
        : await login(email);
      onLogin(user);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setRegisterMode(!registerMode);
    setError(null);
  };

  return (
    <main className="login">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>Pausas Activas</h1>
        <p className="muted">
          {registerMode
            ? 'Crea tu usuario con tu correo institucional'
            : 'Ingresa con tu correo institucional'}
        </p>

        <label>
          Correo (@uniautonoma.edu.co)
          <input
            type="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              setError(null);
            }}
            placeholder="nombre.apellido@uniautonoma.edu.co"
            autoFocus
          />
        </label>

        {registerMode && (
          <>
            <label>
              Nombre
              <input
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError(null);
                }}
              />
            </label>
            <label>
              Carrera (opcional)
              <input value={carrera} onChange={(e) => setCarrera(e.target.value)} />
            </label>
          </>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Cargando…' : registerMode ? 'Registrarme' : 'Ingresar'}
        </button>

        <button type="button" className="link" onClick={toggleMode}>
          {registerMode ? '¿Ya tienes usuario? Ingresa' : '¿Primera vez? Regístrate'}
        </button>

        <p className="small muted">
          Acceso de demostración: solo se comprueba que el correo esté registrado. No hay contraseña.
          <br />
          Servidor: {API_URL}
        </p>
      </form>
    </main>
  );
}
