import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function LoginWithRedirect() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/tickets'); // o la ruta de dashboard que definas
  };

  return <Login onLoginSuccess={handleLoginSuccess} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginWithRedirect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
