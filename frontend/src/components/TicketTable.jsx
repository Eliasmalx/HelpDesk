import React from 'react';

function TicketTable({ tickets, userInfo, onTicketClick }) {
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

  if (!tickets || tickets.length === 0) {
    return <p className="tickets-empty">No hay tickets para mostrar.</p>;
  }

  return (
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
            onClick={() => onTicketClick(t)}
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
  );
}

export default TicketTable;
