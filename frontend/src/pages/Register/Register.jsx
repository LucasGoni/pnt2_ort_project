import React from "react";
import "./Register.css";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Fit&Track</h1>
        <h2 className="signup-subtitle">Crear cuenta</h2>

        <form className="signup-form">
          <input
            type="text"
            placeholder="Nombre completo"
            className="signup-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="signup-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="signup-input"
            required
          />

          <div className="signup-role">
            <label>
              <input type="radio" name="rol" value="entrenador" required />{" "}
              Entrenador
            </label>
            <label>
              <input type="radio" name="rol" value="alumno" required /> Alumno
            </label>
          </div>

          <button type="submit" className="signup-btn">
            Registrarse
          </button>
        </form>

        <p className="signup-login">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="register-link">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
