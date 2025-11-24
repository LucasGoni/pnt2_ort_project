import React from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import "./HomeAlumno.css";

function HomeAlumno() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">¡Hola, Alumno!</h2>
        <p className="subtitle">¿Estas listo para entrenar?</p>
        <p className="subtitle">Revisá tu entrenamiento y progreso:</p>

        <div className="card-grid">
          <div className="card">
            <h3>Mi perfil</h3>
            <p>Actualizá tu nombre, peso, altura y avatar.</p>
            <button onClick={() => navigate("/alumno/perfil")}>
              Editar perfil
            </button>
          </div>
          <div className="card">
            <h3>🏋️‍♀️ Mi rutina</h3>
            <p>
              Consultá tu plan de entrenamiento actual con detalles diarios.
            </p>
            <button>Ver rutina</button>
          </div>

          <div className="card">
            <h3>📅 Calendario</h3>
            <p>Revisá tus días de entrenamiento y próximos objetivos.</p>
            <button onClick={() => navigate("/calendario/alumno")}>
              Ver calendario
            </button>
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
      </main>

      <footer className="footer">
        <LogoutButton />
      </footer>
    </div>
  );
}

export default HomeAlumno;
