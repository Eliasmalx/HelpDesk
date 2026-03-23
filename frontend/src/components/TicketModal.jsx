import React from 'react';
import apiClient from '../api/apiClient';

export default function TicketModal({ 
  ticket, 
  userInfo, 
  onClose, 
  onTicketUpdate, 
  onTicketDelete 
}) {
  if (!ticket) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleAssignToMe = async () => {
    try {
      const updated = await apiClient.assignTicket(ticket.id);
      onTicketUpdate({ ...ticket, assigned_to_email: updated.assigned_to_email });
    } catch (err) { alert(err.message); }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      const updated = await apiClient.updateTicketStatus(ticket.id, newStatus);
      onTicketUpdate({ ...ticket, status: updated.status });
    } catch (err) { alert(err.message); }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await apiClient.uploadFile(ticket.id, file);
      alert('Archivo subido al ticket');
      onTicketUpdate({ ...ticket, has_files: true }); // Notifica a la tabla
      e.target.value = ''; 
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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

        {/* Acciones Superiores */}
        <div className="modal-actions-top">
          <div className="file-upload-section">
            <input
              id={`file-upload-${ticket.id}`}
              type="file"
              accept="image/*,.pdf"
              className="hidden-input"
              onChange={handleUploadFile}
            />
            <label htmlFor={`file-upload-${ticket.id}`} className="file-upload-label">
              📎 Añadir archivo
            </label>
            {ticket.has_files && <span className="file-success-indicator">✓ Archivo adjunto</span>}
          </div>

          {userInfo?.role !== 'user' && (
            <div className="status-buttons">
              <button className="secondary-button" onClick={handleAssignToMe}>Asignarme</button>
              <button className="secondary-button" onClick={() => handleChangeStatus('open')}>Abierto</button>
              <button className="secondary-button" onClick={() => handleChangeStatus('in_progress')}>En progreso</button>
              <button className="secondary-button" onClick={() => handleChangeStatus('closed')}>Cerrado</button>
            </div>
          )}
        </div>

        {/* Acciones Inferiores */}
        <div className="modal-actions-bottom">
          <div className="danger-actions">
            <button className="danger-button" onClick={() => onTicketDelete(ticket.id)}>Eliminar</button>
          </div>
          <div className="standard-actions">
            <button className="secondary-button" onClick={() => alert('Editar en desarrollo')}>Editar</button>
            <button className="primary-button" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
