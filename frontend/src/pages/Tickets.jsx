import React, { useEffect, useState, useMemo } from 'react';
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

    // --- ESTADOS PARA FILTROS Y ORDENAMIENTO ---
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

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

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO (useMemo para rendimiento) ---
  const visibleTickets = useMemo(() => {
    let filtered = [...tickets];

    // 1. Aplicar Búsqueda por texto (título)
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.id.toString().includes(searchQuery)
      );
    }

    // 2. Aplicar Filtro de Estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // 3. Aplicar Filtro de Prioridad
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // 4. Aplicar Ordenamiento
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [tickets, filterStatus, filterPriority, searchQuery, sortConfig]);

  // Manejador para los clics en los encabezados de la tabla
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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

        {/* --- BARRA DE FILTROS --- */}
        <div className="filters-bar">
          <input 
            type="text" 
            placeholder="Buscar por ID o título..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input search-input"
          />
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En progreso</option>
            <option value="closed">Cerrado</option>
          </select>

          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
        
        <TicketTable 
          tickets={visibleTickets} 
          userInfo={userInfo} 
          onTicketClick={(ticket) => setSelectedTicket(ticket)} 
          requestSort={requestSort}
          sortConfig={sortConfig}
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
