import React from 'react';
import './QueueSidebar.css';

function QueueSidebar({ isOpen, onClose, tickets, userInfo, onTicketClick }) {
  if (!userInfo || userInfo.role === 'user') return null;

  // Filtrar: Solo los asignados a mí, y que NO estén cerrados
  const myQueue = tickets.filter(
    (t) => t.assigned_to_email === userInfo.email && t.status !== 'closed'
  );

  return (
    <>
      {/* Fondo oscuro cuando el sidebar está abierto (opcional, para enfocar la vista) */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <div className={`queue-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>📥 Mi Cola ({myQueue.length})</h3>
          <button className="close-sidebar-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sidebar-content">
          {myQueue.length === 0 ? (
            <p className="empty-queue">¡Genial! No tienes tickets pendientes.</p>
          ) : (
            <ul className="queue-list">
              {myQueue.map((t) => (
                <li 
                  key={t.id} 
                  className="queue-item" 
                  onClick={() => {
                    onTicketClick(t);
                    onClose(); // Cierra el sidebar al abrir el modal
                  }}
                >
                  <div className="queue-item-header">
                    <span className="queue-id">#{t.id}</span>
                    <span className={`badge badge-priority-${t.priority}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="queue-title">{t.title}</p>
                  <div className="queue-item-footer">
                    <span className={`badge badge-status-${t.status}`}>
                      {t.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default QueueSidebar;
