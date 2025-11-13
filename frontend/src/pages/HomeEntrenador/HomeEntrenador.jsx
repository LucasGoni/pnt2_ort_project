import React from "react";
import "./HomeEntrenador.css";
import { Link } from "react-router-dom";

function HomeEntrenador() {
  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">¡Bienvenido, Entrenador!</h2>
        <p className="subtitle">Seleccioná una opción para comenzar:</p>

        <div className="card-grid">
          <div className="card">
            <h3>📋 Ver alumnos</h3>
            <p>Consulta la lista de tus alumnos y sus datos de progreso.</p>
            <Link to="/entrenador/alumnos" className="btn-ruta">Ver alumnos</Link>
          </div>

          <div className="card">
            <h3>➕ Crear plan</h3>
            <p>Diseñá un nuevo plan de entrenamiento personalizado.</p>
            <Link to="/entrenador/crear-plan" className="btn-ruta">Crear plan</Link>
          </div>

          <div className="card">
            <h3>🏋️‍♀️ Rutinas</h3>
            <p>Visualizá y editá las rutinas de entrenamiento disponibles.</p>
            <Link to="/entrenador/rutinas" className="btn-ruta">Ver rutinas</Link>
          </div>

          <div className="card">
            <h3>📊 Progreso</h3>
            <p>Monitoreá el rendimiento de cada alumno a lo largo del tiempo.</p>
            <Link to="/entrenador/progreso" className="btn-ruta">Ver progreso</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <Link to="/logout" className="logout-btn">Cerrar sesión</Link>
      </footer>
    </div>
  );
}

export default HomeEntrenador;
