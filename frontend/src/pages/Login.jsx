import React, { useState } from 'react';
import './Login.css';
import apiClient from '../api/apiClient';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiClient.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch-text">
          ¿No tienes cuenta? <a href="/register">Crear cuenta</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
