import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import HomeEntrenador from "./pages/HomeEntrenador/HomeEntrenador";
import HomeAlumno from "./pages/HomeAlumno/HomeAlumno";
import CalendarAlumnoPage from "./pages/Calendar/CalendarAlumnoPage.jsx";
import CalendarEntrenadorPage from "./pages/Calendar/CalendarEntrenadorPage.jsx";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/entrenador" element={<HomeEntrenador />} />
      <Route path="/alumno" element={<HomeAlumno />} />
      <Route path="*" element={<h2 style={{ textAlign: "center" }}>404 - Página no encontrada</h2>} />
      <Route path="/calendario/alumno" element={<CalendarAlumnoPage />} />
      <Route path="/calendario/entrenador" element={<CalendarEntrenadorPage />} />
    </Routes>
  );
}

export default App;
