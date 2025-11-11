import React from "react";
import "./HomeEntrenador.css";

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
            <button>Ir</button>
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
            <p>Monitoreá el rendimiento de cada alumno a lo largo del tiempo.</p>
            <button>Ir</button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <button className="logout-btn">Cerrar sesión</button>
      </footer>
    </div>
  );
}

export default HomeEntrenador;
