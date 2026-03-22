import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Tickets.css';
import TicketModal from '../components/TicketModal';
import TicketTable from '../components/TicketTable'; 

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

  const refreshTickets = async () => {
    try {
      const data = await apiClient.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error recargando tickets:', err);
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

  const handleLogout = () => {
    apiClient.logout();
    navigate('/login');
  };

  const handleNewTicket = () => {
    navigate('/tickets/new');
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
      {/* 1. HEADER */}
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

      {/* 2. TABLA PRINCIPAL */}
      <div className="tickets-card">
        {error && <p className="tickets-error">{error}</p>}
        
        <TicketTable 
          tickets={tickets} 
          userInfo={userInfo} 
          onTicketClick={(ticket) => setSelectedTicket(ticket)} 
        />
      </div>

      {/* 3. MODAL (Renderizado condicionalmente) */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          userInfo={userInfo}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdate={(updatedTicket) => {
            setSelectedTicket(updatedTicket);
            setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            if (updatedTicket.has_files) refreshTickets();
          }}
          onTicketDelete={handleDeleteTicket}
        />
      )}
    </div>
  );
}

export default Tickets;
