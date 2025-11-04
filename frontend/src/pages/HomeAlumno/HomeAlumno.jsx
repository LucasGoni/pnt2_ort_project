import React from "react";
import "./HomeAlumno.css";

function HomeAlumno() {
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
            <button>Ver rutina</button>
          </div>

          <div className="card">
            <h3>📅 Calendario</h3>
            <p>Revisá tus días de entrenamiento y próximos objetivos.</p>
            <button>Ver calendario</button>
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
        <button className="logout-btn">Cerrar sesión</button>
      </footer>
    </div>
  );
}

export default HomeAlumno;
