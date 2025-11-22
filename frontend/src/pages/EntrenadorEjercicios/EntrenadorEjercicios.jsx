import { useEffect, useState } from "react";
import { crearEjercicio, getEjercicios } from "../../services/ejerciciosService";
import "../../App.css";
import "./EntrenadorEjercicios.css";
import BackButton from "../../components/BackButton.jsx";

export default function EntrenadorEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", videoUrl: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getEjercicios();
        if (alive) {
          setEjercicios(data);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error cargando ejercicios", error);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    try {
      const nuevo = await crearEjercicio({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        videoUrl: form.videoUrl.trim(),
      });
      setEjercicios((prev) => [nuevo, ...prev]);
      setForm({ nombre: "", descripcion: "", videoUrl: "" });
      setShowForm(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("No se pudo crear el ejercicio", error);
      }
    }
  };

  return (
    <div className="home-container ejercicios-page">
      <main className="home-main">
        <div className="ej-content">
          <div className="ej-header">
            <BackButton />
            <div>
              <h2 className="welcome">Ejercicios</h2>
              <p className="subtitle">Listado de ejercicios disponibles para tus rutinas.</p>
            </div>
            <button
              type="button"
              className={`add-ej-btn ${showForm ? "is-open" : ""}`}
              onClick={() => setShowForm((v) => !v)}
            >
              <span className="rutina-row-title">{showForm ? "Cerrar formulario" : "Agregar ejercicio"}</span>
              <div className="rutina-row-chips">
                <span className="rutina-row-item">{form.nombre || "Nombre"}</span>
                <span className="rutina-row-item">{form.descripcion ? "Con descripción" : "Descripción"}</span>
                <span className={`rutina-estado ${form.videoUrl ? "activa" : "pausada"}`}>
                  {form.videoUrl ? "Con media" : "Media"}
                </span>
              </div>
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <div className="form-card-header" />
              <div className="form-card-body">
                <h3 className="form-card-title">Nuevo ejercicio</h3>
                <form className="google-form" onSubmit={handleSubmit}>
                  <label>
                    Nombre
                    <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Sentadilla goblet" required />
                  </label>
                  <label>
                    Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Indicaciones breves" rows={3} />
                  </label>
                  <label>
                    URL de GIF/Video (opcional)
                    <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://..." />
                  </label>
                  <div className="form-actions">
                    <button type="submit" className="primary-btn">Guardar</button>
                    <button type="button" onClick={() => setShowForm(false)} className="secondary-btn">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <p>Cargando ejercicios...</p>
          ) : (
            <div className="ej-table-card">
              <div className="form-card-header" />
              <div className="ej-table-wrap">
                <table className="ej-table">
                  <thead>
                    <tr>
                      <th>Ejercicio</th>
                      <th>Descripción</th>
                      <th>Video</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ejercicios.map((ej) => (
                      <tr key={ej.id}>
                        <td>{ej.nombre}</td>
                        <td>{ej.descripcion || "-"}</td>
                        <td>
                          {ej.videoUrl ? (
                            <img src={ej.videoUrl} alt={ej.nombre} className="ej-thumb" />
                          ) : (
                            "Sin video"
                          )}
                        </td>
                      </tr>
                    ))}
                    {!ejercicios.length && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center" }}>Aún no hay ejercicios cargados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
