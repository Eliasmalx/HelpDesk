import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import TicketDetails from './TicketDetails';
import TicketActions from './TicketActions';
import CloseTicketForm from './CloseTicketForm';

export default function TicketModal({ ticket, userInfo, onClose, onTicketUpdate, onTicketDelete }) {
  const [isClosing, setIsClosing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleChangeStatus = async (newStatus, resolutionFeedback = '') => {
    try {
      setLoading(true);
      const updated = await apiClient.updateTicketStatus(ticket.id, newStatus, resolutionFeedback);
      onTicketUpdate({ ...ticket, status: updated.status, resolution_notes: resolutionFeedback });
      setIsClosing(false);
    } catch (err) { 
      alert(err.message); 
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await apiClient.uploadFile(ticket.id, file);
      alert('Archivo subido al ticket');
      onTicketUpdate({ ...ticket, has_files: true, file_url: response.file_url });
      e.target.value = ''; 
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        <TicketDetails ticket={ticket} userInfo={userInfo} formatDate={formatDate} />

        {isClosing ? (
          <CloseTicketForm 
            feedback={feedback}
            setFeedback={setFeedback}
            onCancel={() => setIsClosing(false)}
            onConfirm={() => handleChangeStatus('closed', feedback)}
            loading={loading}
          />
        ) : (
          <TicketActions 
            ticket={ticket}
            userInfo={userInfo}
            handleUploadFile={handleUploadFile}
            handleAssignToMe={handleAssignToMe}
            handleChangeStatus={handleChangeStatus}
            setIsClosing={setIsClosing}
          />
        )}

        <div className="modal-actions-bottom">
          <div className="danger-actions">
            <button className="danger-button" onClick={() => onTicketDelete(ticket.id)}>Eliminar</button>
          </div>
          <div className="standard-actions">
            <button className="secondary-button" onClick={() => alert('Editar en desarrollo')}>Editar</button>
            <button className="primary-button" onClick={onClose}>Salir</button>
          </div>
        </div>
      </div>
    </div>
  );
}
