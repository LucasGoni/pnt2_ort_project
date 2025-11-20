import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackToMenuButton.css";

function BackToMenuButton({ role = "alumno", to, label = "Volver al menú" }) {
  const navigate = useNavigate();
  const targetRoute = to ?? (role === "entrenador" ? "/entrenador" : "/alumno");

  const handleClick = () => {
    navigate(targetRoute);
  };

  return (
    <button type="button" className="back-menu-btn" onClick={handleClick}>
      ← {label}
    </button>
  );
}

export default BackToMenuButton;
