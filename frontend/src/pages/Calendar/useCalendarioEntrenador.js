import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function useCalendarioEntrenador(entrenadorId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!entrenadorId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/entrenadores/${entrenadorId}/calendario`);
      const evts = (data.events || []).map((ev) => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }));
      setEvents(evts);
    } catch (err) {
      setError(err.response?.data?.message || "No pudimos cargar el calendario.");
    } finally {
      setLoading(false);
    }
  }, [entrenadorId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}
