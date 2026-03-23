import React from 'react';

function TicketDetails({ ticket, userInfo, formatDate }) {
  return (
    <>
      <h2>{ticket.title}</h2>
      <p className="modal-meta">
        {userInfo?.role !== 'user' && (
          <>
            Creador: {ticket.created_by_email || '-'} <br />
            Asignado a: {ticket.assigned_to_email || '-'} <br />
          </>
        )}
        Estado: <span className={`badge badge-status-${ticket.status}`}>{ticket.status}</span> · 
        Prioridad: <span className={`badge badge-priority-${ticket.priority}`}>{ticket.priority}</span>
        <br />
        Creado: {formatDate(ticket.created_at)}
      </p>

      <div className="modal-description">
        {ticket.description || 'Sin descripción'}
      </div>

      {ticket.file_url && (
        <div style={{ marginBottom: '16px' }}>
          <a href={ticket.file_url} target="_blank" rel="noopener noreferrer" className="secondary-button" style={{textDecoration: 'none'}}>
            📄 Ver archivo adjunto
          </a>
        </div>
      )}
    </>
  );
}

export default TicketDetails;
