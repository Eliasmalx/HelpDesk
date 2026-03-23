// src/components/TicketActions.jsx
import React from 'react';

function TicketActions({ ticket, userInfo, handleUploadFile, handleAssignToMe, handleChangeStatus, setIsClosing }) {
  return (
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
        {ticket.has_files && !ticket.file_url && <span className="file-success-indicator">✓ Archivo adjunto</span>}
      </div>

      {userInfo?.role !== 'user' && (
        <div className="status-buttons">
          <button className="secondary-button" onClick={handleAssignToMe}>Asignarme</button>
          <button className="secondary-button" onClick={() => handleChangeStatus('open')}>Abierto</button>
          <button className="secondary-button" onClick={() => handleChangeStatus('in_progress')}>En progreso</button>
          <button 
            className={`secondary-button ${ticket.status === 'closed' ? 'chip-active' : ''}`} 
            onClick={() => setIsClosing(true)}
          >
            Cerrar Ticket
          </button>
        </div>
      )}
    </div>
  );
}

export default TicketActions;
