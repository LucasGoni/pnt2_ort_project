import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";

function App() {
  return (
    <Routes>
      {/* Ruta principal redirige a login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Rutas individuales */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta por defecto */}
      <Route path="*" element={<h2 style={{ textAlign: "center" }}>404 - Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;
