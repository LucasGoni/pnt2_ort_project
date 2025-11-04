import React from "react";
import "./Login.css"; // lo creamos abajo

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Fit&Track</h1>
        <h2 className="login-subtitle">Iniciar sesión</h2>

        <form className="login-form">
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            required
          />

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>

        <p className="login-register">
          ¿No tenés cuenta?{" "}
          <a href="#" className="login-link">
            Registrate
          </a>
        </p>
      </div>
    </div>
  );
}
