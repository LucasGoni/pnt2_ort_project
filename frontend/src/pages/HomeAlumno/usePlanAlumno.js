import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const DIA_INDEX = { lun: 0, mar: 1, mie: 2, jue: 3, vie: 4, sab: 5, dom: 6 };

const startOfWeekMonday = (date = new Date()) => {
  const base = new Date(date);
  const day = base.getDay(); // 0 domingo, 1 lunes...
  const diff = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diff);
  base.setHours(0, 0, 0, 0);
  return base;
};

const toLocalISODate = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const mapPlanToEvents = (plan, referenceDate = new Date()) => {
  if (!plan) return [];

  const monday = startOfWeekMonday(referenceDate);
  const rutinasById = new Map(plan.rutinas?.map((r) => [r.id, r]) ?? []);
  const sesiones = plan.sesiones ?? [];

  const events = [];

  plan.asignacion?.forEach((item) => {
    const rutina = rutinasById.get(item.rutinaId);
    if (!rutina) return;

    item.dias.forEach((dia) => {
      const offset = DIA_INDEX[dia];
      if (offset === undefined) return;

      const start = new Date(monday);
      start.setDate(monday.getDate() + offset);
      start.setHours(9, 0, 0, 0);

      const end = new Date(start);
      end.setHours(10, 0, 0, 0);

      const fechaISO = toLocalISODate(start);
      const sesion = sesiones.find((s) => s.fecha === fechaISO && s.rutinaId === rutina.id);
      const done = sesion?.done ?? false;

      events.push({
        title: `${done ? "✅ " : ""}${rutina.nombre}`,
        start,
        end,
        meta: {
          rutinaId: rutina.id,
          done,
        },
      });
    });
  });

  return events.sort((a, b) => a.start - b.start);
};

/**
 * Hook para obtener el plan del alumno y mapearlo al calendario.
 */
export default function usePlanAlumno(alumnoId) {
  const [plan, setPlan] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    if (!alumnoId) {
      setIsLoading(false);
      setPlan(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/alumnos/${alumnoId}/plan`);
      setPlan(data.plan);
    } catch (err) {
      setError(err.response?.data?.message || "No pudimos traer tu plan.");
    } finally {
      setIsLoading(false);
    }
  }, [alumnoId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    setEvents(mapPlanToEvents(plan));
  }, [plan]);

  const saveAsignacion = useCallback(
    async (draftAsignacion) => {
      try {
        const { data } = await api.put(`/api/alumnos/${alumnoId}/plan/asignacion`, {
          asignacion: draftAsignacion,
        });
        setPlan(data.plan);
        setError(null);
        return data.plan;
      } catch (err) {
        const message = err.response?.data?.message || "No pudimos guardar la asignación.";
        setError(message);
        throw err;
      }
    },
    [alumnoId]
  );

  const toggleSesion = useCallback(
    async (fecha, rutinaId, done) => {
      try {
        const { data } = await api.patch(`/api/alumnos/${alumnoId}/plan/sesiones/${fecha}`, {
          rutinaId,
          done,
        });
        setPlan(data.plan);
        setError(null);
        return data.plan;
      } catch (err) {
        const message = err.response?.data?.message || "No pudimos actualizar la sesión.";
        setError(message);
        throw err;
      }
    },
    [alumnoId]
  );

  return {
    plan,
    events,
    isLoading,
    error,
    saveAsignacion,
    toggleSesion,
    refetch: fetchPlan,
  };
}
