import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Tickets.css';

function Tickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
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
      <div className="tickets-container">
        <div className="tickets-card">Cargando tickets...</div>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <header className="tickets-header">
        <h1>Mis Tickets</h1>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="tickets-card">
        {error && <p className="tickets-error">{error}</p>}

        {tickets.length === 0 ? (
          <p className="tickets-empty">No tienes tickets creados todavía.</p>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.title}</td>
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
    </div>
  );
}

export default Tickets;
