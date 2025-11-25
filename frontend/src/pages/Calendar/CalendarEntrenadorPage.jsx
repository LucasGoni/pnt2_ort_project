import React from "react";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";
import { useAuth } from "../../context/AuthContext";
import useCalendarioEntrenador from "./useCalendarioEntrenador";

export default function CalendarEntrenadorPage() {
  const { user } = useAuth();
  const entrenadorId = user?.id || user?.userId || user?.entrenadorId || null;
  const { events, loading, error } = useCalendarioEntrenador(entrenadorId);

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <h2 className="calendar-title">📅 Calendario – Entrenador</h2>
        {error && <p style={{ color: "#c53030" }}>{error}</p>}

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar
              mode="entrenador"
              defaultView="week"
              events={events}
              loading={loading}
              eventPropGetter={(event) => {
                const done = event.meta?.done;
                return done
                  ? { style: { backgroundColor: "#2563eb", opacity: 0.7 } }
                  : { style: { backgroundColor: "#2563eb" } };
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
