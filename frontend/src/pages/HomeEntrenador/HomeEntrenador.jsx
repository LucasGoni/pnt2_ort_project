// src/pages/HomeEntrenador/HomeEntrenador.jsx
import React, { useState } from "react";
import "./HomeEntrenador.css";
import { useNavigate } from "react-router-dom";
import ListadoAlumnos from "../../components/ListadoAlumnos/ListadoAlumnos";

function HomeEntrenador() {
  const navigate = useNavigate();
  const [mostrarPopupAlumnos, setMostrarPopupAlumnos] = useState(false);

  const abrirPopupAlumnos = () => {
    setMostrarPopupAlumnos(true);
  };

  const cerrarPopupAlumnos = () => {
    setMostrarPopupAlumnos(false);
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">¡Bienvenido, Entrenador!</h2>
        <p className="subtitle">Seleccioná una opción para comenzar:</p>

        <div className="card-grid">
          <div className="card">
            <h3>📋 Ver alumnos</h3>
            <p>Consulta la lista de tus alumnos y sus datos de progreso.</p>
            <button onClick={abrirPopupAlumnos}>Mis alumnos</button>
          </div>

          <div className="card">
            <h3>➕ Crear plan</h3>
            <p>Diseñá un nuevo plan de entrenamiento personalizado.</p>
            <button>Ir</button>
          </div>

          <div className="card">
            <h3>🏋️‍♀️ Rutinas</h3>
            <p>Visualizá y editá las rutinas de entrenamiento disponibles.</p>
            <button>Ir</button>
          </div>

          <div className="card">
            <h3>📊 Progreso</h3>
            <p>
              Monitoreá el rendimiento de cada alumno a lo largo del tiempo.
            </p>
            <button>Ir</button>
          </div>

          <div className="card">
            <h3>📅 Calendario</h3>
            <p>Ver alumnos que entrenan cada día.</p>
            <button onClick={() => navigate("/calendario/entrenador")}>
              Ver calendario
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <button className="logout-btn">Cerrar sesión</button>
      </footer>

      {/* 🔹 POPUP ALUMNOS (Home queda de fondo) */}
      {mostrarPopupAlumnos && (
        <div className="popup-overlay" onClick={cerrarPopupAlumnos}>
          <div
            className="popup-panel"
            onClick={(e) => e.stopPropagation()} // para que no se cierre al hacer click adentro
          >
            <div className="popup-header">
              <h3>Mis alumnos</h3>
              <button className="popup-close" onClick={cerrarPopupAlumnos}>
                ×
              </button>
            </div>

            <div className="popup-body">
              <ListadoAlumnos />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeEntrenador;
