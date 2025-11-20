import { useEffect, useState } from "react";
import { getAlumnosAll } from "../../services/alumnosServices.js";
import { getRutinasAll } from "../../services/rutinasServices.js";
import "../../App.css";
import "./CrearPlan.css";

export default function CrearPlan() {
  const [alumnos, setAlumnos] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [form, setForm] = useState({ alumnoId: "", rutinaId: "", inicio: "", fin: "" });
  const [mensaje, setMensaje] = useState("");

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
  };

  return (
    <div className="home-container plan-page">
      <main className="home-main">
        <div className="plan-header">
          <div>
            <p className="plan-kicker">Asignación</p>
            <h2 className="welcome">Crear plan</h2>
            <p className="subtitle">Asigná una rutina a un alumno por un período definido.</p>
          </div>
          <div className="plan-badge">
            <span>Plan rápido</span>
          </div>
        </div>

        <form className="plan-card" onSubmit={handleSubmit}>
          <div className="plan-grid">
            <label className="plan-field">
              <span>Alumno</span>
              <select name="alumnoId" value={form.alumnoId} onChange={handleChange} required>
                <option value="">Elegí alumno</option>
                {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </label>

            <label className="plan-field">
              <span>Rutina</span>
              <select name="rutinaId" value={form.rutinaId} onChange={handleChange} required>
                <option value="">Elegí rutina</option>
                {rutinas.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}
              </select>
            </label>

            <label className="plan-field">
              <span>Inicio</span>
              <input type="date" name="inicio" value={form.inicio} onChange={handleChange} required />
            </label>

            <label className="plan-field">
              <span>Fin</span>
              <input type="date" name="fin" value={form.fin} onChange={handleChange} required />
            </label>
          </div>

          <button type="submit" className="primary-btn plan-submit">Asignar plan</button>
        </form>

        {mensaje && (
          <div className="plan-alert">
            {mensaje}
          </div>
        )}
      </main>
    </div>
  );
}
