import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './TechDashboard.css';

function TechDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        // asume que el backend, si el usuario es técnico/admin, devuelve todos los tickets
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

    fetchTickets();
  }, [navigate]);

  const handleLogout = () => {
    apiClient.logout();
    navigate('/login');
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

  if (loading) {
    return (
      <div className="tech-container">
        <div className="tech-card">Cargando cola de tickets...</div>
      </div>
    );
  }

  return (
    <div className="tech-container">
      <header className="tech-header">
        <h1>Cola de Tickets (Técnico)</h1>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="tech-card">
        {error && <p className="tickets-error">{error}</p>}

        {tickets.length === 0 ? (
          <p className="tickets-empty">No hay tickets en la cola.</p>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Creado por</th>
                <th>Asignado a</th>
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
                  <td>{t.created_by_email || '-'}</td>
                  <td>{t.assigned_to_email || '-'}</td>
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
              Creador: {selectedTicket.created_by_email || '-'} <br />
              Asignado a: {selectedTicket.assigned_to_email || '-'} <br />
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

            {/* Más adelante aquí irán botones Asignar / Cambiar estado */}
            <button className="primary-button" onClick={() => setSelectedTicket(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechDashboard;
