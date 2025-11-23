import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataList from "../../components/DataList";
import { useAuth } from "../../context/AuthContext";
import usePlanAlumno from "../HomeAlumno/usePlanAlumno";
import "../Calendar/CalendarPage.css";

const DIA_LABEL = {
  lun: "Lun",
  mar: "Mar",
  mie: "Mié",
  jue: "Jue",
  vie: "Vie",
  sab: "Sáb",
  dom: "Dom",
};

export default function PlanAlumnoPage() {
  const { user } = useAuth();
  const searchId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("alumnoId") : null;
  // Priorizamos alumnoId (tabla alumnos) antes que el id de usuario
  const alumnoId = searchId || user?.alumnoId || user?.id || user?.userId || null;
  const navigate = useNavigate();

  const { plan, isLoading, error } = usePlanAlumno(alumnoId);

  const rows = useMemo(() => {
    if (!plan) return [];
    return (plan.rutinas ?? []).map((rutina) => {
      const asignacion = plan.asignacion?.find((a) => a.rutinaId === rutina.id);
      return {
        ...rutina,
        dias: asignacion?.dias ?? [],
        orden: asignacion?.orden ?? null,
      };
    });
  }, [plan]);

  const columns = [
    { key: "nombre", header: "Rutina", accessor: "nombre", sortable: true },
    {
      key: "descripcion",
      header: "Descripción",
      accessor: (r) => r.descripcion || "—",
    },
    {
      key: "duracion",
      header: "Duración",
      accessor: (r) => r.duracionMin ?? "—",
      render: (v) => (v === "—" ? "—" : `${v} min`),
      sortable: true,
    },
    {
      key: "dias",
      header: "Días asignados",
      accessor: (r) => r.dias ?? [],
      render: (dias) => (dias.length ? dias.map((d) => DIA_LABEL[d] || d).join(", ") : "Sin asignar"),
    },
    {
      key: "orden",
      header: "Orden semanal",
      accessor: (r) => r.orden ?? "—",
      sortable: true,
    },
  ];

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>🏋️ Plan de entrenamiento</h2>
            <p style={{ margin: "4px 0 0" }}>
              Rutinas asignadas a tu plan actual. Podés ajustar los días en el calendario.
            </p>
          </div>
          <button className="calendar-btn" onClick={() => navigate("/calendario/alumno")}>
            Ir al calendario
          </button>
        </div>

        <div style={{ marginTop: "12px" }}>
          <p style={{ margin: "0 0 4px", color: "#6d28d9" }}>
            Plan: <strong>{plan?.nombre ?? "Cargando..."}</strong>
          </p>
          <p style={{ margin: 0, color: "#6d28d9" }}>
            Entrenador/a: {plan?.entrenador?.nombre || "—"} · Vigencia: desde {plan?.vigencia?.desde || "—"}
          </p>
        </div>

        {error && <p style={{ color: "#c53030", marginTop: "8px" }}>{error}</p>}

        <div style={{ marginTop: "16px" }}>
          <DataList columns={columns} data={rows} loading={isLoading} searchable />
        </div>
      </div>
    </div>
  );
}
