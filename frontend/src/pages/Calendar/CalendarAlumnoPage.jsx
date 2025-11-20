import React from "react";
import BackToMenuButton from "../../components/BackToMenuButton/BackToMenuButton";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";

export default function CalendarAlumnoPage() {
  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-header">
          <BackToMenuButton role="alumno" />
          <h2 className="calendar-title">Calendario alumno</h2>
          <span className="calendar-header-spacer" aria-hidden="true" />
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar mode="alumno" />
          </div>
        </div>
      </div>
    </div>
  );
}
