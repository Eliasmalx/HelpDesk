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
        // 1) datos del usuario (incluye role)
        const me = await apiClient.getMe();
        setUserInfo(me);

        // 2) tickets según rol (el backend decide qué devolver)
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
    const confirmDelete = window.confirm('¿Estás seguro de eliminar este ticket?');
    if (!confirmDelete) return;

    try {
      await apiClient.deleteTicket(selectedTicket.id); 
      setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));
      setSelectedTicket(null); // cierra el modal tras borrar
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
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
            {userInfo?.role !== 'user' && (
              <div className="modal-actions" style={{ marginBottom: '16px' }}>
                <button
                  className="secondary-button"
                  onClick={handleAssignToMe}
                >
                  Asignarme
                </button>

                <div className="status-buttons" style={{ display: 'flex', gap: '6px' }}>
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
              </div>
            )}

            {/* SECCIÓN AÑADIDA: Botones generales inferiores */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
              <button className="secondary-button" style={{ color: '#ef4444' }} onClick={handleDeleteTicket}>
                Eliminar
              </button>
              
              {/* Botón Editar: En el futuro puedes hacer que abra un formulario o redirija a /tickets/:id/edit */}
              <button className="secondary-button" onClick={() => alert('Función de editar en desarrollo')}>
                Editar
              </button>
              
              <button className="primary-button" onClick={() => setSelectedTicket(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
