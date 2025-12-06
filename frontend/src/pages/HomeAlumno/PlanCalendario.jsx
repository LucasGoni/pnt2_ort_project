import React, { useEffect, useMemo, useState } from "react";
import Calendar from "../../components/Calendar/Calendar";
import { useAuth } from "../../context/AuthContext";
import usePlanAlumno from "./usePlanAlumno";
import "./PlanCalendario.css";

const DIAS = [
  { code: "lun", label: "L" },
  { code: "mar", label: "M" },
  { code: "mie", label: "X" },
  { code: "jue", label: "J" },
  { code: "vie", label: "V" },
  { code: "sab", label: "S" },
  { code: "dom", label: "D" },
];

const toLocalISODate = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const formatFechaCorta = (date) =>
  new Date(date).toLocaleDateString("es-AR", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

const toTimeInputValue = (date) => {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function PlanCalendario() {
  const { user } = useAuth();
  const searchId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("alumnoId") : null;
  const alumnoId = searchId || user?.alumnoId || user?.id || user?.userId || null; // preferimos alumnoId

  const { plan, events, isLoading, error, saveAsignacion, toggleSesion, updateSesionLocal, refetch } = usePlanAlumno(alumnoId);
  const [draftAsignacion, setDraftAsignacion] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sesionLoadingId, setSesionLoadingId] = useState(null);
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);

  useEffect(() => {
    if (!plan) return;
    const normalizada = plan.rutinas.map((rutina, idx) => {
      const existing = plan.asignacion?.find((a) => a.rutinaId === rutina.id);
      return (
        existing ?? {
          rutinaId: rutina.id,
          dias: [],
          orden: idx + 1,
        }
      );
    });
    setDraftAsignacion(normalizada);
  }, [plan]);

  const rutinasMap = useMemo(() => new Map(plan?.rutinas?.map((r) => [r.id, r]) ?? []), [plan]);

  const sesionesSemana = useMemo(
    () =>
      events
        .filter((e) => e.meta?.rutinaId)
        .map((event) => {
          const rutinaId = event.meta.rutinaId;
          const rutina = rutinasMap.get(rutinaId);
          const nombre = rutina?.nombre || rutina?.titulo || `Rutina ${rutinaId}`;
          return {
            key: `${rutinaId}-${toLocalISODate(event.start)}`,
            fecha: toLocalISODate(event.start),
            rutinaId,
            nombre,
            done: event.meta?.done ?? false,
            feeling: event.meta?.feeling || null,
            start: event.start,
            end: event.end,
          };
        })
        .sort((a, b) => a.start - b.start),
    [events, rutinasMap]
  );

  const toggleDay = (rutinaId, dia) => {
    setDraftAsignacion((prev) =>
      prev.map((item) => {
        if (item.rutinaId !== rutinaId) return item;
        const yaTiene = item.dias.includes(dia);
        const dias = yaTiene ? item.dias.filter((d) => d !== dia) : [...item.dias, dia];
        return { ...item, dias };
      })
    );
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      await saveAsignacion(draftAsignacion);
      await refetch(); // recarga el plan para reflejar los cambios en la vista
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSesion = async (sesion) => {
    try {
      setSesionLoadingId(sesion.key);
      updateSesionLocal(sesion.fecha, sesion.rutinaId, { ...sesion, done: !sesion.done });
      await toggleSesion(sesion.fecha, sesion.rutinaId, !sesion.done, sesion.start, sesion.end, sesion.feeling);
      setEmojiPickerFor(null);
      await refetch(); // refrescamos estado para permitir edición de días sin recargar
    } finally {
      setSesionLoadingId(null);
    }
  };

  const handleHorarioChange = async (sesion, field, value) => {
    const [hh, mm] = value.split(":").map(Number);
    const base = new Date(sesion.start);
    const nuevaFecha = new Date(base);
    nuevaFecha.setHours(hh || 0, mm || 0, 0, 0);
    const startISO = field === "start" ? nuevaFecha.toISOString() : sesion.start?.toISOString?.() || sesion.start;
    let endISO;
    if (field === "end") {
      endISO = nuevaFecha.toISOString();
    } else {
      const endDate = sesion.end ? new Date(sesion.end) : new Date(base);
      endDate.setHours((hh || 0) + 1, mm || 0, 0, 0);
      endISO = endDate.toISOString();
    }
    try {
      setSesionLoadingId(sesion.key);
      updateSesionLocal(sesion.fecha, sesion.rutinaId, {
        ...sesion,
        start: startISO,
        end: endISO,
      });
      await toggleSesion(sesion.fecha, sesion.rutinaId, sesion.done, startISO, endISO, sesion.feeling);
    } finally {
      setSesionLoadingId(null);
    }
  };

  const handleSetFeeling = async (sesion, feeling) => {
    try {
      setSesionLoadingId(sesion.key);
      updateSesionLocal(sesion.fecha, sesion.rutinaId, { ...sesion, feeling });
      await toggleSesion(sesion.fecha, sesion.rutinaId, sesion.done, sesion.start, sesion.end, feeling);
      setEmojiPickerFor(null);
      await refetch();
    } finally {
      setSesionLoadingId(null);
    }
  };

  return (
    <section className="plan-calendario">
      <div className="plan-panel">
        <div className="plan-header">
          <div>
            <p className="plan-etiqueta">Plan asignado</p>
            <h3 className="plan-nombre">{plan?.nombre ?? "Plan en preparación"}</h3>
          </div>
          <div className="plan-alumno">
            <p className="plan-etiqueta">Alumno</p>
            <strong>{user?.nombre || user?.email || `ID ${alumnoId}`}</strong>
            <span className="plan-rol">alumno</span>
          </div>
        </div>

        {isLoading ? (
          <p className="plan-loading">Cargando plan...</p>
        ) : (
          <>
            <div className="plan-rutinas">
              <div className="plan-rutinas-header">
                <h4>Rutinas y días</h4>
                <p>Definí en qué días se entrena cada rutina. L → D.</p>
              </div>

              {draftAsignacion.map((item) => {
                const rutina = rutinasMap.get(item.rutinaId);
                return (
                  <div className="rutina-row" key={item.rutinaId}>
                    <div className="rutina-top">
                      <div>
                        <p className="rutina-nombre">{rutina?.nombre}</p>
                        {rutina?.descripcion && <p className="rutina-descripcion">{rutina.descripcion}</p>}
                      </div>
                    </div>

                    <div className="dias-selector">
                      {DIAS.map((dia) => {
                        const activo = item.dias.includes(dia.code);
                        return (
                          <label
                            key={`${item.rutinaId}-${dia.code}`}
                            className={`dia-chip ${activo ? "activo" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={activo}
                              onChange={() => toggleDay(item.rutinaId, dia.code)}
                            />
                            {dia.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <p className="plan-error">{error}</p>}

            <button className="guardar-asignacion-btn" onClick={handleGuardar} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </>
        )}
      </div>

        <div className="calendar-panel">
          <div className="calendar-panel-header">
            <div>
              <p className="plan-etiqueta">Semana</p>
              <h4>Calendario semanal</h4>
            </div>
          </div>

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar
              mode="alumno"
              defaultView="week"
              events={events}
              eventPropGetter={(event) => {
                const done = event.meta?.done;
                return done
                  ? { style: { backgroundColor: "#7c3aed", opacity: 0.65 } }
                  : {};
              }}
            />
          </div>
        </div>

        <div className="sesiones-panel">
          <h5>Sesiones de esta semana</h5>
          <ul className="sesiones-lista">
            {sesionesSemana.map((sesion) => (
              <li key={sesion.key}>
                <div className="sesion-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={sesion.done}
                      onChange={() => handleToggleSesion(sesion)}
                      disabled={sesionLoadingId === sesion.key}
                    />
                    <span>
                      {formatFechaCorta(sesion.start)} — {sesion.nombre || `Rutina ${sesion.rutinaId}`}
                      {sesion.done ? " (completada)" : ""}
                    </span>
                  </label>
                  <div className="emoji-picker">
                    <button
                      type="button"
                      className="emoji-trigger"
                      onClick={() => setEmojiPickerFor(prev => (prev === sesion.key ? null : sesion.key))}
                      disabled={!sesion.done}
                      title={sesion.feeling ? `Te sentiste: ${sesion.feeling}` : "Cómo te sentiste"}
                    >
                      {sesion.feeling || "😊"}
                    </button>
                    {emojiPickerFor === sesion.key && (
                      <div className="emoji-menu">
                        {["😊", "💪", "😓", "😴", "🔥", "🙂"].map((emo) => (
                          <button
                            key={emo}
                            type="button"
                            onClick={() => handleSetFeeling(sesion, emo)}
                            disabled={sesionLoadingId === sesion.key}
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="horario-editor">
                  <label>
                    Inicio
                    <input
                      type="time"
                      value={toTimeInputValue(sesion.start)}
                      onChange={(e) => handleHorarioChange(sesion, "start", e.target.value)}
                      disabled={sesionLoadingId === sesion.key}
                    />
                  </label>
                  <label>
                    Fin
                    <input
                      type="time"
                      value={toTimeInputValue(sesion.end || sesion.start)}
                      onChange={(e) => handleHorarioChange(sesion, "end", e.target.value)}
                      disabled={sesionLoadingId === sesion.key}
                    />
                  </label>
                </div>
              </li>
            ))}
            {!sesionesSemana.length && <li className="sesion-vacia">Aún no hay sesiones para esta semana.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
