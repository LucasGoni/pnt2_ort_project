import React from "react";
import BackToMenuButton from "../../components/BackToMenuButton/BackToMenuButton";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";

export default function CalendarEntrenadorPage() {
  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-header">
          <BackToMenuButton role="entrenador" />
          <h2 className="calendar-title">Calendario entrenador</h2>
          <span className="calendar-header-spacer" aria-hidden="true" />
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar mode="entrenador" />
          </div>
        </div>
      </div>
    </div>
  );
}
