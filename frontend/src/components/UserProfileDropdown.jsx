import React, { useState, useRef, useEffect } from 'react';
import './UserProfileDropdown.css';
import apiClient from '../api/apiClient'; // Para la futura lógica de guardar ajustes

function UserProfileDropdown({ userInfo, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  // Estados para el modal de ajustes
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userInfo) return null;

  // Obtener la inicial del email para el avatar
  const initial = userInfo.email ? userInfo.email.charAt(0).toUpperCase() : '?';

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Aquí llamarías a un endpoint real como apiClient.updateProfile(...)
      // await apiClient.updateProfile({ currentPassword, newPassword, notificationsEnabled });
      
      // Simulamos éxito para el MVP
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Ajustes guardados correctamente.' });
        setCurrentPassword('');
        setNewPassword('');
        setLoading(false);
      }, 800);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al guardar.' });
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-wrapper" ref={dropdownRef}>
      {/* Botón Avatar */}
      <button 
        className="avatar-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de usuario"
      >
        <div className="avatar-circle">{initial}</div>
      </button>

      {/* Menú Dropdown */}
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p className="dropdown-email">{userInfo.email}</p>
            <p className="dropdown-role">Rol: {userInfo.role}</p>
          </div>
          <div className="dropdown-body">
            <button 
              className="dropdown-item"
              onClick={() => {
                setIsOpen(false);
                setShowSettings(true);
              }}
            >
              ⚙️ Ajustes de Perfil
            </button>
            <button 
              className="dropdown-item text-danger"
              onClick={onLogout}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Modal de Ajustes */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-card settings-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Ajustes de Perfil</h2>
            
            <div className="settings-info">
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Rol:</strong> {userInfo.role === 'user' ? 'Usuario' : 'Técnico/Admin'}</p>
            </div>

            <form onSubmit={handleSaveSettings} className="settings-form">
              <h3>Cambiar Contraseña</h3>
              <div className="form-field">
                <label>Contraseña actual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Dejar en blanco si no deseas cambiarla"
                />
              </div>
              <div className="form-field">
                <label>Nueva contraseña</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <h3>Preferencias</h3>
              <div className="toggle-field">
                <label className="toggle-label">
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span>Recibir notificaciones por email</span>
                </label>
              </div>

              {message.text && (
                <p className={`settings-msg ${message.type === 'error' ? 'ticket-error' : 'ticket-success'}`}>
                  {message.text}
                </p>
              )}

              <div className="modal-actions-bottom" style={{ marginTop: '24px' }}>
                <button type="button" className="secondary-button" onClick={() => setShowSettings(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfileDropdown;
