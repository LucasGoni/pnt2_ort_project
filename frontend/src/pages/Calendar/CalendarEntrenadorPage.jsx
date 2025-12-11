import React, { useEffect, useState } from "react";
import { parseISO, isValid } from "date-fns";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";
import { listarPlanes } from "../../services/planesService";
import { useAuth } from "../../context/AuthContext";

export default function CalendarEntrenadorPage() {
  const { user } = useAuth();
  const entrenadorId = user?.id || user?.userId || user?.entrenadorId || null;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    if (!entrenadorId) {
      setEvents([]);
      setError("");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const planes = await listarPlanes();
        const evts = [];

        planes.forEach((plan) => {
          const asignaciones = Array.isArray(plan.asignaciones)
            ? plan.asignaciones
            : [];
          const sesiones = Array.isArray(plan.sesiones) ? plan.sesiones : [];

          // Preferimos mostrar sesiones concretas (día/horario elegidos por el alumno)
          if (plan.alumnoId && sesiones.length) {
            const asigAlumno = asignaciones.find(
              (a) => String(a.alumnoId) === String(plan.alumnoId)
            );

            // Solo mostrar si fue asignado por este entrenador o el plan es suyo
            const habilitado =
              plan.entrenadorId === entrenadorId ||
              (asigAlumno?.asignadoPor && asigAlumno.asignadoPor === entrenadorId);

            if (habilitado) {
              const alumnoNombre =
                asigAlumno?.alumnoNombre ||
                asigAlumno?.alumnoId ||
                `Alumno ${plan.alumnoId}`;

              sesiones.forEach((sesion) => {
                if (!sesion.fecha) return;
                const start = sesion.start
                  ? new Date(sesion.start)
                  : parseISO(sesion.fecha);
                const end = sesion.end ? new Date(sesion.end) : null;
                if (!isValid(start)) return;
                if (end && !isValid(end)) return;

                evts.push({
                  title: `${alumnoNombre}${plan.nombre ? ` – ${plan.nombre}` : ""}`,
                  start,
                  end: end || start,
                  kind: "sesion",
                  meta: { done: !!sesion.done },
                });
              });
            }
            return;
          }

          asignaciones.forEach((asig) => {
            if (asig.asignadoPor && asig.asignadoPor !== entrenadorId) return;
            const sesiones = Array.isArray(asig.sesiones) ? asig.sesiones : [];
            if (!sesiones.length) return; // no mostrar hasta que el alumno defina días/horarios

            sesiones.forEach((sesion) => {
              if (!sesion.fecha) return;
              const start = sesion.start ? new Date(sesion.start) : parseISO(sesion.fecha);
              const end = sesion.end ? new Date(sesion.end) : null;
              if (!isValid(start)) return;
              if (end && !isValid(end)) return;

              evts.push({
                title:
                  `${asig.alumnoNombre || `Alumno ${asig.alumnoId || ""}`}` +
                  (plan.nombre ? ` – ${plan.nombre}` : ""),
                start,
                end: end || start,
                kind: "sesion",
                meta: { done: !!sesion.done },
              });
            });
          });
        });

        if (!alive) return;
        setEvents(evts);
        setError("");
      } catch (err) {
        if (!alive) return;
        setEvents([]);
        setError("No pudimos cargar tus asignaciones.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [entrenadorId]);

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <h2 className="calendar-title">📅 Calendario – Entrenador</h2>

        {error && (
          <p className="calendar-error" style={{ color: "#c53030" }}>
            {error}
          </p>
        )}

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
