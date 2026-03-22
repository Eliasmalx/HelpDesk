import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    const payload = {
      title,
      description,
      category,
      priority,
    };

    const data = await apiClient.createTicket(payload);

    // Si hay archivo, subirlo al ticket recién creado
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


  const handleCancel = () => {
    navigate('/tickets');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="create-ticket-container">
      <header className="create-ticket-header">
        <h1>Nuevo Ticket</h1>
        <button className="back-button" onClick={handleCancel}>
          Volver
        </button>
      </header>

      <div className="create-ticket-card">
        <form onSubmit={handleSubmit} className="create-ticket-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                placeholder="Ej. Problema con la impresora"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="form-field">
              <label htmlFor="category">Categoría</label>
              <input
                id="category"
                type="text"
                placeholder="Ej. Hardware, Software..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="priority">Prioridad</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              rows="5"
              placeholder="Describe el problema con el mayor detalle posible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="file-upload">Captura de pantalla (opcional)</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            {filePreview && (
              <img src={filePreview} alt="Preview" className="file-preview" />
            )}
          </div>

          {error && <p className="ticket-error">{error}</p>}
          {success && <p className="ticket-success">{success}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleCancel}
            >
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
