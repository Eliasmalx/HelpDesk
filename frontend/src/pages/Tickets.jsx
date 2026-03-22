import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Tickets.css';

function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const me = await apiClient.getMe();
        setUserInfo(me);

        const data = await apiClient.getTickets();
        setTickets(data);
      } catch (err) {
        setError(err.message);
        if (err.message.toLowerCase().includes('token')) {
          apiClient.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Función para recargar la tabla después de cambios (como subir un archivo)
  const refreshTickets = async () => {
    try {
      const data = await apiClient.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error recargando tickets:', err);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    navigate('/login');
  };

  const handleNewTicket = () => {
    navigate('/tickets/new');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket) return;
    try {
      const updated = await apiClient.assignTicket(selectedTicket.id);
      setSelectedTicket({
        ...selectedTicket,
        assigned_to_email: updated.assigned_to_email,
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, assigned_to_email: updated.assigned_to_email }
            : t
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updated = await apiClient.updateTicketStatus(selectedTicket.id, newStatus);
      setSelectedTicket({
        ...selectedTicket,
        status: updated.status,
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, status: updated.status } : t
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este ticket? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    try {
      await apiClient.deleteTicket(selectedTicket.id);
      setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));
      setSelectedTicket(null); 
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleEditTicket = () => {
    if (!selectedTicket) return;
    // Redirige a la página de edición, pasando el ID en la URL
    navigate(`/tickets/${selectedTicket.id}/edit`);
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTicket) return;

    try {
      await apiClient.uploadFile(selectedTicket.id, file);
      alert('Archivo subido al ticket');
      
      // Actualizar el estado local para que el modal sepa que ya tiene archivo
      setSelectedTicket({ ...selectedTicket, has_files: true });
      
      // Recargar la lista principal para que el icono gris cambie a verde
      await refreshTickets();
      
      e.target.value = ''; 
    } catch (err) {
      alert('Error al subir archivo: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="tickets-container">
        <div className="tickets-card">Cargando tickets...</div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <header className="tickets-header">
        <div>
          <h1>Tickets</h1>
          {userInfo && (
            <p className="tickets-subtitle">
              Sesión: {userInfo.email} · Rol: <strong>{userInfo.role}</strong>
            </p>
          )}
        </div>

        <div className="tickets-header-actions">
          {userInfo?.role === 'user' && (
            <button className="primary-button" onClick={handleNewTicket}>
              Nuevo ticket
            </button>
          )}
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="tickets-card">
        {error && <p className="tickets-error">{error}</p>}

        {tickets.length === 0 ? (
          <p className="tickets-empty">No hay tickets para mostrar.</p>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                {userInfo?.role !== 'user' && <th>Creado por</th>}
                {userInfo?.role !== 'user' && <th>Asignado a</th>}
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Archivos</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="ticket-row-clickable"
                  onClick={() => setSelectedTicket(t)}
                >
                  <td>{t.id}</td>
                  <td>{t.title}</td>
                  {userInfo?.role !== 'user' && (
                    <>
                      <td>{t.created_by_email || '-'}</td>
                      <td>{t.assigned_to_email || '-'}</td>
                    </>
                  )}
                  <td>
                    <span className={`badge badge-status-${t.status || 'open'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-priority-${t.priority || 'medium'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="file-status-cell">
                    {t.has_files ? (
                      <span className="file-icon" title="Tiene archivos adjuntos">📎</span>
                    ) : (
                      <span className="no-file-icon" title="Sin archivos">📄</span>
                    )}
                  </td>
                  <td>{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTicket.title}</h2>
            <p className="modal-meta">
              {userInfo?.role !== 'user' && (
                <>
                  Creador: {selectedTicket.created_by_email || '-'} <br />
                  Asignado a: {selectedTicket.assigned_to_email || '-'} <br />
                </>
              )}
              Estado:{' '}
              <span className={`badge badge-status-${selectedTicket.status || 'open'}`}>
                {selectedTicket.status}
              </span>{' '}
              · Prioridad:{' '}
              <span className={`badge badge-priority-${selectedTicket.priority || 'medium'}`}>
                {selectedTicket.priority}
              </span>
              <br />
              Creado: {formatDate(selectedTicket.created_at)}
            </p>

            <div className="modal-description">
              {selectedTicket.description || 'Sin descripción'}
            </div>

            {/* Acciones de Técnico y Subida de Archivos */}
            <div className="modal-actions-top">
              <div className="file-upload-section">
                <input
                  id={`file-upload-${selectedTicket.id}`}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden-input"
                  onChange={handleUploadFile}
                />
                <label
                  htmlFor={`file-upload-${selectedTicket.id}`}
                  className="file-upload-label"
                >
                  📎 Añadir archivo
                </label>
                {selectedTicket.has_files && (
                  <span className="file-success-indicator">✓ Archivo adjunto</span>
                )}
              </div>

              {userInfo?.role !== 'user' && (
                <div className="status-buttons">
                  <button
                    className="secondary-button"
                    onClick={handleAssignToMe}
                  >
                    Asignarme
                  </button>

                  <button
                    className={`chip-button ${selectedTicket.status === 'open' ? 'chip-active' : ''}`}
                    onClick={() => handleChangeStatus('open')}
                  >
                    Abierto
                  </button>
                  <button
                    className={`chip-button ${selectedTicket.status === 'in_progress' ? 'chip-active' : ''}`}
                    onClick={() => handleChangeStatus('in_progress')}
                  >
                    En progreso
                  </button>
                  <button
                    className={`chip-button ${selectedTicket.status === 'closed' ? 'chip-active' : ''}`}
                    onClick={() => handleChangeStatus('closed')}
                  >
                    Cerrado
                  </button>
                </div>
              )}
            </div>

            {/* Botones generales inferiores (CSS limpio) */}
            <div className="modal-actions-bottom">
              <div className="danger-actions">
                <button
                  className="danger-button"
                  onClick={handleDeleteTicket}
                >
                  Eliminar
                </button>
              </div>
              
              <div className="standard-actions">
                <button
                  className="secondary-button"
                  onClick={handleEditTicket}
                >
                  Editar
                </button>

                <button
                  className="primary-button"
                  onClick={() => setSelectedTicket(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
