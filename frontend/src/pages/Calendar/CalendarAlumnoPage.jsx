import React from "react";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";

export default function CalendarAlumnoPage() {
  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <h2 className="calendar-title">📅 Calendario – Alumno</h2>

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar mode="alumno" />
          </div>
        </div>
      </div>
    </div>
  );
}
