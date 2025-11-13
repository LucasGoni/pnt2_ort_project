import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import HomeEntrenador from "./pages/HomeEntrenador/HomeEntrenador";
import HomeAlumno from "./pages/HomeAlumno/HomeAlumno";
import { RutinasList } from "./features/rutinas/components/RutinasList.jsx";
import { EjerciciosList } from "./features/ejercicios/components/EjerciciosList.jsx";
import { AlumnosList } from "./features/alumnos/components/AlumnosList.jsx";

function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* entrenador */}
      <Route path="/entrenador" element={<HomeEntrenador />} />
      <Route path="/entrenador/rutinas" element={<RutinasList />} />      
      <Route path="/entrenador/ejercicios" element={<EjerciciosList />} />
      <Route path="/entrenador/alumnos" element={<AlumnosList />} />

      {/* alumno */}
      <Route path="/alumno" element={<HomeAlumno />} />

      {/* admin */}
      <Route path="/admin" element={<div>Dashboard Admin</div>} />        
      <Route path="/admin/rutinas" element={<RutinasList />} />           
      <Route path="/admin/ejercicios" element={<EjerciciosList />} />
      <Route path="/admin/alumnos" element={<AlumnosList />} />     

      {/* 404 */}
      <Route path="*" element={<h2 style={{ textAlign: "center" }}>404 - Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;
