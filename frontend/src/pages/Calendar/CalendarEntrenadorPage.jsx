import React from "react";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";

export default function CalendarEntrenadorPage() {
  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <h2 className="calendar-title">📅 Calendario – Entrenador</h2>

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar mode="entrenador" />
          </div>
        </div>
      </div>
    </div>
  );
}
