import React, { useEffect, useMemo, useState } from "react";
import BackButton from "../../components/BackButton";
import { useAuth } from "../../context/AuthContext";
import { getProgresoAlumno, registrarProgresoAlumno } from "../../services/progresoService";
import "./ProgresoAlumno.css";

const formatISO = (date) => date.toISOString().slice(0, 10);

const defaultRange = () => {
  const today = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { desde: formatISO(start), hasta: formatISO(today) };
};

function ProgresoAlumno() {
  const { user } = useAuth();
  const alumnoId = user?.id;

  const [filtro, setFiltro] = useState(defaultRange);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ registros: [], resumen: {} });
  const [form, setForm] = useState({
    fechaRegistro: formatISO(new Date()),
    peso: "",
    observaciones: "",
  });

  const seriePeso = useMemo(() => data?.resumen?.seriePeso || [], [data]);
  const pesos = useMemo(() => seriePeso.map((p) => p.peso), [seriePeso]);
  const maxPeso = useMemo(() => (pesos.length ? Math.max(...pesos) : 0), [pesos]);

  const cargarProgreso = async (range = filtro) => {
    if (!alumnoId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getProgresoAlumno(alumnoId, range);
      setData(response);
    } catch (err) {
      const message = err.response?.data?.message || "No se pudo cargar el progreso";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProgreso();
  }, [alumnoId]);

  const handleSubmitRegistro = async (event) => {
    event.preventDefault();
    if (!alumnoId) return;
    setLoading(true);
    setError("");
    try {
      await registrarProgresoAlumno(alumnoId, {
        ...form,
        peso: form.peso === "" ? null : Number(form.peso),
      });
      await cargarProgreso();
    } catch (err) {
      const message = err.response?.data?.message || "No se pudo registrar el progreso";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyRange = (event) => {
    event.preventDefault();
    cargarProgreso(filtro);
  };

  const resumen = data?.resumen || {};

  return (
    <div className="progreso-page">
      <div className="progreso-hero">
        <BackButton />
        <div>
          <p className="eyebrow">Seguimiento</p>
          <h1>Progreso</h1>
          <p className="lead">
            Visualiza tu evolución en peso, repeticiones y entrenamientos realizados.
          </p>
        </div>
      </div>

      <section className="panel filtros-panel">
        <div className="subpanel">
          <div className="panel-header">
            <p className="panel-title">Rango de fechas</p>
            <p className="muted">Filtra los registros para comparar periodos.</p>
          </div>
          <form className="filtros" onSubmit={applyRange}>
            <label>
              Desde
              <input
                type="date"
                value={filtro.desde}
                onChange={(e) => setFiltro((prev) => ({ ...prev, desde: e.target.value }))}
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={filtro.hasta}
                onChange={(e) => setFiltro((prev) => ({ ...prev, hasta: e.target.value }))}
              />
            </label>
            <button type="submit" className="btn-secondary" disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </form>
        </div>
        <div className="subpanel">
          <div className="panel-header">
            <p className="panel-title">Registrar progreso</p>
            <p className="muted">Carga rápida de tu peso del día.</p>
          </div>
          <form className="registro-form" onSubmit={handleSubmitRegistro}>
            <div className="registro-grid">
              <label>
                Fecha
                <input
                  type="date"
                  name="fechaRegistro"
                  value={form.fechaRegistro}
                  onChange={handleChange}
                />
              </label>
              <label>
                Peso (kg)
                <input
                  type="number"
                  name="peso"
                  step="0.1"
                  value={form.peso}
                  onChange={handleChange}
                  placeholder="Ej: 72.4"
                />
              </label>
              <label className="full">
                Observaciones
                <input
                  type="text"
                  name="observaciones"
                  maxLength={180}
                  value={form.observaciones}
                  onChange={handleChange}
                  placeholder=""
                />
              </label>
            </div>
            <div className="acciones">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar registro"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="panel resumen-panel">
        <div className="summary-grid">
          <div className="summary-card">
            <p className="label">Peso mínimo</p>
            <strong>{resumen.pesoMin ? `${resumen.pesoMin} kg` : "—"}</strong>
          </div>
          <div className="summary-card">
            <p className="label">Peso máximo</p>
            <strong>{resumen.pesoMax ? `${resumen.pesoMax} kg` : "—"}</strong>
          </div>
          <div className="summary-card">
            <p className="label">Peso promedio</p>
            <strong>{resumen.pesoPromedio ? `${resumen.pesoPromedio} kg` : "—"}</strong>
          </div>
          <div className="summary-card">
            <p className="label">Sesiones completadas</p>
            <strong>{resumen.sesionesCompletadas ?? 0}</strong>
          </div>
          <div className="summary-card">
            <p className="label">Registros en rango</p>
            <strong>{data?.registros?.length ?? 0}</strong>
          </div>
        </div>
      </section>

      <section className="panel series-panel">
        <div className="series-header">
          <div>
            <p className="panel-title">Peso en el tiempo</p>
            <p className="muted">Compará cada registro con tu valor más alto.</p>
          </div>
          <span className="legend">
            <span className="legend-bar"></span> kg
          </span>
        </div>
        {seriePeso.length === 0 && <p className="muted">No hay pesos cargados en este rango.</p>}
        <div className="serie-list">
          {seriePeso.map((item) => {
            const width = maxPeso ? Math.max(8, (item.peso / maxPeso) * 100) : 0;
            return (
              <div className="serie-row" key={`${item.fecha}-${item.peso}`}>
                <div className="serie-meta">
                  <span className="fecha">{item.fecha}</span>
                  <strong>{item.peso} kg</strong>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel registros-panel">
        <div className="panel-title">Historial detallado</div>
        {data?.registros?.length === 0 ? (
          <p className="muted">Todavía no cargaste registros en este rango.</p>
        ) : (
          <div className="tabla">
            <div className="tabla-head">
              <span>Fecha</span>
              <span>Peso</span>
              <span>Notas</span>
            </div>
            {data.registros.map((r) => (
              <div className="tabla-row" key={`${r.id}-${r.fechaRegistro}`}>
                <span>{r.fechaRegistro}</span>
                <span>{r.peso ?? "—"}</span>
                <span className="notas">{r.observaciones || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProgresoAlumno;
