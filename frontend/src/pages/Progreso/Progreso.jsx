import { useEffect, useMemo, useState } from "react";
import "./Progreso.css";
import { useAuth } from "../../context/AuthContext";
import storage from "../../services/storage";
import usePlanAlumno from "../HomeAlumno/usePlanAlumno";
import BackButton from "../../components/BackButton.jsx";

const getStorageKey = (alumnoId) => `progress_weight_${alumnoId}`;

const toLocalISODate = (date = new Date()) => {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

export default function Progreso() {
  const { user } = useAuth();
  const alumnoId = user?.alumnoId || user?.id || user?.userId || null;
  const { events, isLoading, error, refetch } = usePlanAlumno(alumnoId);

  const [peso, setPeso] = useState("");
  const [fecha, setFecha] = useState(toLocalISODate());
  const [entries, setEntries] = useState([]);
  const [from, setFrom] = useState(toLocalISODate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(toLocalISODate());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!alumnoId) return;
    (async () => {
      const stored = await storage.getItem(getStorageKey(alumnoId));
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setEntries(Array.isArray(parsed) ? parsed : []);
        } catch (_e) {
          setEntries([]);
        }
      }
    })();
  }, [alumnoId]);

  const saveEntries = async (next) => {
    setEntries(next);
    await storage.setItem(getStorageKey(alumnoId), JSON.stringify(next));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!alumnoId || !peso || !fecha) return;
    setSaving(true);
    setMsg("");
    try {
      const next = [...entries, { peso: Number(peso), fecha }].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
      await saveEntries(next);
      setPeso("");
      setMsg("Registro guardado");
    } finally {
      setSaving(false);
    }
  };

  const sesionesEnRango = useMemo(() => {
    if (!events?.length || !from || !to) return [];
    const start = new Date(from);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    return events.filter((e) => {
      const d = new Date(e.start);
      return d >= start && d <= end && e.meta?.done;
    });
  }, [events, from, to]);

  const sesionesConFeeling = useMemo(() => {
    return (events || [])
      .filter((e) => e.meta?.feeling)
      .map((e) => ({
        feeling: e.meta.feeling,
        fecha: e.start,
        titulo: e.title?.replace("✅ ", "") || "Sesión",
      }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [events]);

  const feelingTotals = useMemo(() => {
    const totals = {};
    sesionesConFeeling.forEach((s) => {
      totals[s.feeling] = (totals[s.feeling] || 0) + 1;
    });
    return totals;
  }, [sesionesConFeeling]);

  const pesoActual = entries[0]?.peso ?? (user?.peso ?? null);
  const pesoMin = entries.reduce((min, e) => (min === null || e.peso < min ? e.peso : min), null);
  const pesoMax = entries.reduce((max, e) => (max === null || e.peso > max ? e.peso : max), null);
  const entriesSortedAsc = [...entries].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const chartData = useMemo(() => {
    if (!entriesSortedAsc.length) return null;
    const min = pesoMin ?? 0;
    const max = pesoMax ?? min;
    const range = max - min || 1;
    const count = entriesSortedAsc.length;
    const xStart = 12;
    const xEnd = 90;
    const yBottom = 85;
    const yTop = 20;
    const points = entriesSortedAsc.map((e, idx) => {
      const x = count === 1 ? (xStart + xEnd) / 2 : xStart + (idx / (count - 1)) * (xEnd - xStart);
      const y = yBottom - ((e.peso - min) / range) * (yBottom - yTop);
      return { x, y, label: `${e.peso} kg` };
    });
    return { points, min, max };
  }, [entriesSortedAsc, pesoMin, pesoMax]);
  const firstDate =
    entriesSortedAsc[0]?.fecha &&
    new Date(entriesSortedAsc[0].fecha).toLocaleDateString("es-AR", { month: "short", year: "numeric" });
  const lastDate =
    entriesSortedAsc[entriesSortedAsc.length - 1]?.fecha &&
    new Date(entriesSortedAsc[entriesSortedAsc.length - 1].fecha).toLocaleDateString("es-AR", { month: "short", year: "numeric" });

  return (
    <div className="progress-page">
      <div className="progress-topbar">
        <BackButton />
        <h2>Progreso</h2>
      </div>

      {!alumnoId ? (
        <p className="progress-error">No pudimos identificar al alumno.</p>
      ) : (
        <div className="progress-grid">
          <section className="progress-card">
            <h3>Registro de peso</h3>
            <form className="weight-form" onSubmit={handleAdd}>
              <label>
                Fecha
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </label>
              <label>
                Peso (kg)
                <input
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Guardando..." : "Agregar"}
              </button>
            </form>
            {msg && <p className="progress-msg">{msg}</p>}
            <div className="weight-list">
              {entries.length === 0 && <p className="muted">Aún no registraste peso.</p>}
              {entries.map((e, idx) => (
                <div key={`${e.fecha}-${idx}`} className="weight-row">
                  <span>{new Date(e.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <strong>{e.peso} kg</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="progress-card">
            <h3>Sesiones completadas</h3>
            <div className="range-row">
              <label>
                Desde
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                Hasta
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <button type="button" className="secondary-btn" onClick={refetch} disabled={isLoading}>
                Actualizar
              </button>
            </div>
            {error && <p className="progress-error">{error}</p>}
            <div className="session-summary">
              <p className="session-count">{sesionesEnRango.length}</p>
              <p className="muted">sesiones completadas en el período</p>
            </div>
            <div className="session-list">
              {sesionesEnRango.length === 0 && <p className="muted">Sin sesiones completadas en este rango.</p>}
              {sesionesEnRango.map((s, idx) => (
                <div key={`${s.start}-${idx}`} className="session-row">
                  <span>{new Date(s.start).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" })}</span>
                  <span>{s.title?.replace("✅ ", "")}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="progress-card">
            <h3>Resumen rápido</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <p className="muted">Peso actual</p>
                <strong>{pesoActual ? `${pesoActual} kg` : "—"}</strong>
              </div>
              <div className="summary-item">
                <p className="muted">Mínimo</p>
                <strong>{pesoMin !== null ? `${pesoMin} kg` : "—"}</strong>
              </div>
              <div className="summary-item">
                <p className="muted">Máximo</p>
                <strong>{pesoMax !== null ? `${pesoMax} kg` : "—"}</strong>
              </div>
            </div>
          </section>

          <section className="progress-card">
            <h3>Cómo te sentiste en los entrenamientos</h3>
            {Object.keys(feelingTotals).length === 0 ? (
              <p className="muted">Aún no cargaste emociones en tus sesiones.</p>
            ) : (
              <>
                <div className="feelings-grid">
                  {Object.entries(feelingTotals).map(([emo, count]) => (
                    <div key={emo} className="feeling-chip">
                      <span className="feeling-emoji">{emo}</span>
                      <span className="feeling-count">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="feelings-list">
                  {sesionesConFeeling.map((s, idx) => (
                    <div key={`${s.fecha}-${idx}`} className="feeling-row">
                      <span className="feeling-emoji">{s.feeling}</span>
                      <div className="feeling-info">
                        <strong>{s.titulo}</strong>
                        <small>
                          {new Date(s.fecha).toLocaleDateString("es-AR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          })}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
