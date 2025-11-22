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

export default function PlanCalendario() {
  const { user } = useAuth();
  const alumnoId = user?.id || user?.alumnoId || "42"; // fallback al seed

  const { plan, events, isLoading, error, saveAsignacion, toggleSesion } = usePlanAlumno(alumnoId);
  const [draftAsignacion, setDraftAsignacion] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sesionLoadingId, setSesionLoadingId] = useState(null);

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
          return {
            key: `${rutinaId}-${toLocalISODate(event.start)}`,
            fecha: toLocalISODate(event.start),
            rutinaId,
            nombre: rutina?.nombre ?? event.title,
            done: event.meta?.done ?? false,
            start: event.start,
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

  const updateOrden = (rutinaId, orden) => {
    const valor = Number(orden) || 1;
    setDraftAsignacion((prev) => prev.map((item) => (item.rutinaId === rutinaId ? { ...item, orden: valor } : item)));
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      await saveAsignacion(draftAsignacion);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSesion = async (sesion) => {
    try {
      setSesionLoadingId(sesion.key);
      await toggleSesion(sesion.fecha, sesion.rutinaId, !sesion.done);
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
            <p className="plan-objetivo">{plan?.objetivo}</p>
            <p className="plan-entrenador">Entrenador/a: {plan?.entrenador?.nombre}</p>
            <p className="plan-vigencia">Vigencia: desde {plan?.vigencia?.desde}</p>
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
                      <label className="orden-badge">
                        Orden
                        <input
                          type="number"
                          min={1}
                          value={item.orden ?? 1}
                          onChange={(e) => updateOrden(item.rutinaId, e.target.value)}
                        />
                      </label>
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
            <p className="calendar-subtitle">Horarios por defecto: 09:00 a 10:00.</p>
          </div>
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar mode="alumno" defaultView="week" events={events} />
          </div>
        </div>

        <div className="sesiones-panel">
          <h5>Sesiones de esta semana</h5>
          <ul className="sesiones-lista">
            {sesionesSemana.map((sesion) => (
              <li key={sesion.key}>
                <label>
                  <input
                    type="checkbox"
                    checked={sesion.done}
                    onChange={() => handleToggleSesion(sesion)}
                    disabled={sesionLoadingId === sesion.key}
                  />
                  <span>
                    {formatFechaCorta(sesion.start)} — {sesion.nombre}
                    {sesion.done ? " (completada)" : ""}
                  </span>
                </label>
              </li>
            ))}
            {!sesionesSemana.length && <li className="sesion-vacia">Aún no hay sesiones para esta semana.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
