// src/components/ListadoAlumnos/ListadoAlumnos.jsx
import React from "react";
import "./ListadoAlumnos.css";

// POR AHORA: datos de prueba.
// Después esto lo podés reemplazar por datos reales del backend.
const alumnosMock = [
  { id: 1, nombre: "Juan", apellido: "Pérez", edad: 25 },
  { id: 2, nombre: "María", apellido: "García", edad: 30 },
  { id: 3, nombre: "Lucas", apellido: "Rodríguez", edad: 22 },
];

function ListadoAlumnos({ alumnos = alumnosMock }) {
  if (!alumnos || alumnos.length === 0) {
    return (
      <div className="listado-alumnos">
        <p className="listado-alumnos-vacio">
          Todavía no tenés alumnos asignados.
        </p>
      </div>
    );
  }

  return (
    <div className="listado-alumnos">
      <ul className="lista-alumnos">
        {alumnos.map((alumno) => (
          <li key={alumno.id} className="alumno-item">
            <div className="alumno-nombre">
              {alumno.nombre} {alumno.apellido}
            </div>
            <div className="alumno-edad">{alumno.edad} años</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListadoAlumnos;
