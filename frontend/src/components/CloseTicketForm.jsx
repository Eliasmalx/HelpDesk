import React from 'react';

function CloseTicketForm({ feedback, setFeedback, onCancel, onConfirm, loading }) {
  return (
    <div className="close-confirmation-box" style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#f9fafb' }}>Confirmar cierre</h4>
      <textarea 
        rows="3" 
        placeholder="Añade un feedback o nota de resolución (opcional)..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', background: '#111827', color: 'white', border: '1px solid #4b5563' }}
      />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="secondary-button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button 
          className="primary-button" 
          onClick={onConfirm}
          disabled={loading}
          style={{ background: '#10b981' }} 
        >
          {loading ? 'Cerrando...' : 'Confirmar Cierre'}
        </button>
      </div>
    </div>
  );
}

export default CloseTicketForm;
