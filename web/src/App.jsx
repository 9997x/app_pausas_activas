import { useState } from 'react';
import LoginPage from './components/LoginPage.jsx';
import SessionsPage from './components/SessionsPage.jsx';

const STORAGE_KEY = 'pausas_activas_usuario';

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  // Igual que SessionStore.kt en Android: se recuerda el usuario para saber a cuál apuntar.
  const [user, setUser] = useState(loadUser);

  const handleLogin = (dto) => {
    const session = { id: dto._id, correo: dto.correo, nombre: dto.nombre };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return user ? (
    <SessionsPage user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
