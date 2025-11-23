import React from "react";
import "./HomeAlumno.css";
import { useNavigate } from "react-router-dom";
import MiRutina from "./MiRutina";
import { useAuth } from "../../context/AuthContext";

function HomeAlumno() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">¡Hola, Alumno!</h2>
        <p className="subtitle">¿Estas listo para entrenar?</p>
        <p className="subtitle">Revisá tu entrenamiento y progreso:</p>

        <div className="card-grid">
          <div className="card">
            <h3>🏋️‍♀️ Mi rutina</h3>
            <p>Consultá tu plan de entrenamiento actual con detalles diarios.</p>
            <button onClick={() => navigate("/plan/alumno")}>Ver rutina</button>
          </div>

          <div className="card">
            <h3>📅 Calendario</h3>
            <p>Revisá tus días de entrenamiento y próximos objetivos.</p>
            <button onClick={() => navigate("/calendario/alumno")}>Ver calendario</button>
          </div>

          <div className="card">
            <h3>📊 Progreso</h3>
            <p>Visualizá tu evolución y los logros alcanzados.</p>
            <button>Ver progreso</button>
          </div>

          <div className="card">
            <h3>💬 Mensajes</h3>
            <p>Leé los comentarios y recomendaciones de tu entrenador.</p>
            <button>Ver mensajes</button>
          </div>
        </div>

        <div className="mi-rutina-section">
          <div className="plan-section-header">
            <div>
              <h3>Mi rutina</h3>
              <p>Rutinas asignadas a tu plan vigente.</p>
            </div>
            <div className="plan-alumno">
              <p className="plan-etiqueta">Alumno</p>
              <strong>{user?.nombre || user?.email || "Vos"}</strong>
            </div>
          </div>
          <MiRutina />
        </div>
      </main>

      <footer className="footer">
        <button className="logout-btn">Cerrar sesión</button>
      </footer>
    </div>
  );
}

export default HomeAlumno;
