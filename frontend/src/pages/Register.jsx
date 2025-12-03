import React, { useState } from 'react';
import './Register.css';
import apiClient from '../api/apiClient';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await apiClient.register(email, password, 'user');
      setSuccess('Cuenta creada correctamente. Ya puedes iniciar sesión.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear cuenta</h2>
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <label htmlFor="confirmPassword">Repetir contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-switch-text">
          ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
