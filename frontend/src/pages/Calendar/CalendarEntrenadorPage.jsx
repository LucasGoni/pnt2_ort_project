import React, { useEffect, useState } from "react";
import { parseISO, endOfDay, isValid } from "date-fns";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";
import { listarPlanes } from "../../services/planesService";
import { useAuth } from "../../context/AuthContext";

export default function CalendarEntrenadorPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.id) return;
      try {
        const planes = await listarPlanes();
        const evts = [];
        planes.forEach((plan) => {
          const asignaciones = Array.isArray(plan.asignaciones) ? plan.asignaciones : [];
          asignaciones.forEach((asig) => {
            // sólo mostramos asignaciones hechas por este entrenador (o sin dato, asumimos suyas)
            if (asig.asignadoPor && asig.asignadoPor !== user.id) return;
            if (!asig.desde || !asig.hasta) return;
            const start = parseISO(asig.desde);
            const end = endOfDay(parseISO(asig.hasta));
            if (!isValid(start) || !isValid(end)) return;
            evts.push({
              title: `${asig.alumnoNombre || `Alumno ${asig.alumnoId || ""}`}` + (plan.nombre ? ` – ${plan.nombre}` : ""),
              start,
              end,
              kind: "asignacion",
            });
          });
        });
        if (alive) setEvents(evts);
      } catch (err) {
        if (alive) {
          setEvents([]);
          setError("No pudimos cargar tus asignaciones.");
        }
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <h2 className="calendar-title">📅 Calendario – Entrenador</h2>
        {error && <p className="calendar-error">{error}</p>}
        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar mode="entrenador" events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
