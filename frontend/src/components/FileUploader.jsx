import React, { useRef, useState } from 'react';
import './FileUploader.css';

function FileUploader({ onFileSelect, maxSizeMB = 5 }) {
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación de tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo es demasiado grande (máximo ${maxSizeMB}MB)`);
      e.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file); // Envía el archivo al componente padre

    // Crear preview visual si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setError('');
    onFileSelect(null); // Notifica al padre que se quitó el archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="custom-file-upload">
      <input
        id="file-upload"
        type="file"
        accept="image/*,.pdf"
        className="hidden-input"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {!selectedFile ? (
        <label htmlFor="file-upload" className="upload-box">
          <span className="upload-icon">📁</span>
          <span className="upload-text">Haz clic para adjuntar archivo</span>
          <span className="upload-hint">Soporta PNG, JPG, PDF (Max {maxSizeMB}MB)</span>
        </label>
      ) : (
        <div className="file-preview-container">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="file-preview-img" />
          ) : (
            <div className="document-preview">
              📄 <span>{selectedFile.name}</span>
            </div>
          )}
          <button 
            type="button" 
            className="remove-file-btn" 
            onClick={handleRemoveFile}
            title="Quitar archivo"
          >
            ✕
          </button>
        </div>
      )}
      {error && <p className="file-upload-error">{error}</p>}
    </div>
  );
}

export default FileUploader;
