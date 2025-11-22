import { useEffect, useState } from "react";
import { getAlumnosAll } from "../../services/alumnosServices.js";
import { getRutinasAll } from "../../services/rutinasServices.js";
import "../../App.css";
import "./CrearPlan.css";
import BackButton from "../../components/BackButton.jsx";

export default function CrearPlan() {
  const [alumnos, setAlumnos] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [form, setForm] = useState({ alumnoId: "", rutinaId: "", inicio: "", fin: "" });
  const [mensaje, setMensaje] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [a, r] = await Promise.all([getAlumnosAll(), getRutinasAll()]);
      if (alive) {
        setAlumnos(a);
        setRutinas(r);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setMensaje("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.alumnoId || !form.rutinaId || !form.inicio || !form.fin) return;
    const alumno = alumnos.find(a => a.id === form.alumnoId);
    const rutina = rutinas.find(r => r.id === form.rutinaId);
    setMensaje(`Plan asignado: ${rutina?.titulo} para ${alumno?.nombre} del ${form.inicio} al ${form.fin}.`);
    setShowForm(false);
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

                  <label>
                    Rutina
                    <select name="rutinaId" value={form.rutinaId} onChange={handleChange} required>
                      <option value="">Elegí rutina</option>
                      {rutinas.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}
                    </select>
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
                    <button type="submit" className="primary-btn">Asignar plan</button>
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
        </div>
      </main>
    </div>
  );
}
