import { useEffect, useState } from "react";
import { getAlumnosAll, asignarPlanAAlumno } from "../../services/alumnosServices.js";
import { getRutinasAll } from "../../services/rutinasServices.js";
import "../../App.css";
import "./CrearPlan.css";
import BackButton from "../../components/BackButton.jsx";

export default function CrearPlan() {
  const [alumnos, setAlumnos] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [form, setForm] = useState({ alumnoId: "", rutinasIds: [], inicio: "", fin: "", nombre: "" });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [a, r] = await Promise.all([getAlumnosAll({ includeUnassigned: true }), getRutinasAll()]);
        if (alive) {
          setAlumnos(a);
          setRutinas(r);
        }
      } catch (err) {
        if (alive) setError(err?.response?.data?.message || "No pudimos cargar alumnos/rutinas");
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "rutinasIds") {
      const valNum = Number(value);
      setForm((prev) => {
        const current = new Set(prev.rutinasIds);
        if (checked) current.add(valNum);
        else current.delete(valNum);
        return { ...prev, rutinasIds: Array.from(current) };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    setMensaje("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    if (!form.alumnoId || !form.rutinasIds.length || !form.inicio || !form.fin) return;
    const alumnoIdNum = Number(form.alumnoId);
    const alumno = alumnos.find(a => Number(a.id) === alumnoIdNum);
    const rutinasSeleccionadas = rutinas.filter(r => form.rutinasIds.includes(Number(r.id)));

    setLoading(true);
    try {
      await asignarPlanAAlumno(alumnoIdNum, {
        nombre: form.nombre || "Plan personalizado",
        objetivo: rutinasSeleccionadas[0]?.objetivo || "Pendiente",
        rutinas: form.rutinasIds,
        vigencia: { desde: form.inicio, hasta: form.fin },
      });
      setMensaje(`Plan asignado a ${alumno?.nombre} con ${form.rutinasIds.length} rutina(s) del ${form.inicio} al ${form.fin}.`);
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || "No pudimos asignar el plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container plan-page">
      <main className="home-main">
        <div className="plan-content">
          <div className="plan-header">
            <BackButton />
            <div>
              <p className="plan-kicker">Asignación</p>
              <h2 className="welcome">Crear plan</h2>
              <p className="subtitle">Asigná una rutina a un alumno por un período definido.</p>
            </div>
            <div className="plan-badge">
              <span>Plan rápido</span>
            </div>
          </div>

          <div className="rutinas-actions">
            <button
              type="button"
              className={`add-plan-btn ${showForm ? "is-open" : ""}`}
              onClick={() => setShowForm(prev => !prev)}
            >
              <div className="add-rutina-content">
                <span className="rutina-row-title">{showForm ? "Cerrar formulario" : "Crear plan"}</span>
                <div className="rutina-row-chips">
                  <span className="rutina-row-item">{alumnos.find(a => a.id === form.alumnoId)?.nombre || "Alumno"}</span>
                  <span className="rutina-row-item">{rutinas.find(r => r.id === form.rutinaId)?.titulo || "Rutina"}</span>
                  <span className="rutina-row-item">{form.inicio || "Inicio"}</span>
                  <span className="rutina-row-item">{form.fin || "Fin"}</span>
                </div>
              </div>
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <div className="form-card-header" />
              <div className="form-card-body">
                <h3 className="form-card-title">Nuevo plan</h3>
                <form className="google-form" onSubmit={handleSubmit}>
                  <label>
                    Alumno
                    <select name="alumnoId" value={form.alumnoId} onChange={handleChange} required>
                      <option value="">Elegí alumno</option>
                      {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </label>

                  <fieldset className="rutinas-fieldset">
                    <legend>Rutinas (seleccioná una o varias)</legend>
                    <div className="rutinas-grid">
                      {rutinas.map((r) => (
                        <label key={r.id} className="rutina-checkbox">
                          <input
                            type="checkbox"
                            name="rutinasIds"
                            value={r.id}
                            checked={form.rutinasIds.includes(Number(r.id))}
                            onChange={handleChange}
                          />
                          {r.titulo} ({r.nivel})
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label>
                    Nombre del plan
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Plan personalizado"
                    />
                  </label>

                  <label>
                    Inicio
                    <input type="date" name="inicio" value={form.inicio} onChange={handleChange} required />
                  </label>

                  <label>
                    Fin
                    <input type="date" name="fin" value={form.fin} onChange={handleChange} required />
                  </label>

                  <div className="form-actions">
                    <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Asignando..." : "Asignar plan"}</button>
                    <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {mensaje && (
            <div className="plan-alert">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="plan-alert error">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
