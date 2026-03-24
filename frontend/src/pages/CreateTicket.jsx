import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import FileUploader from '../components/FileUploader';
import './CreateTicket.css';

function CreateTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Solo guardamos la referencia al archivo final

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await apiClient.createTicket({ title, description, category, priority });

      // Si FileUploader nos pasó un archivo válido, lo subimos
      if (selectedFile) {
        await apiClient.uploadFile(data.ticket_id, selectedFile);
      }

      setSuccess('Ticket creado correctamente');
      setTimeout(() => navigate('/tickets'), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-container">
      <header className="create-ticket-header">
        <h1>Nuevo Ticket</h1>
        <button className="back-button" onClick={() => navigate('/tickets')}>
          Volver
        </button>
      </header>

      <div className="create-ticket-card">
        <form onSubmit={handleSubmit} className="create-ticket-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="title">Título *</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required minLength={3}
              />
            </div>
            <div className="form-field">
              <label htmlFor="category">Categoría</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Network">Red</option>
                <option value="Other">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="priority">Prioridad</label>
              <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* COMPONENTE EXTRAÍDO */}
          <div className="form-field">
            <label>Captura de pantalla o documento (opcional)</label>
            <FileUploader onFileSelect={(file) => setSelectedFile(file)} />
          </div>

          {error && <p className="ticket-error">{error}</p>}
          {success && <p className="ticket-success">{success}</p>}

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => navigate('/tickets')} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Creando...' : 'Crear ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicket;
