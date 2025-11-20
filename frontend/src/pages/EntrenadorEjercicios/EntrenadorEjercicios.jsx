import { useEffect, useState } from "react";
import { crearEjercicio, getEjercicios } from "../../services/ejerciciosService";
import "../../App.css";
import "./EntrenadorEjercicios.css";

export default function EntrenadorEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", videoUrl: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await getEjercicios();
      if (alive) {
        setEjercicios(data);
        setLoading(false);
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
    const nuevo = await crearEjercicio({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      videoUrl: form.videoUrl.trim(),
    });
    setEjercicios((prev) => [nuevo, ...prev]);
    setForm({ nombre: "", descripcion: "", videoUrl: "" });
    setShowForm(false);
  };

  return (
    <div className="home-container ejercicios-page">
      <main className="home-main">
        <div className="ej-header">
          <div>
            <h2 className="welcome">Ejercicios</h2>
            <p className="subtitle">Listado de ejercicios disponibles para tus rutinas.</p>
          </div>
          <button className="primary-btn ghost" onClick={() => setShowForm((v) => !v)}>
            ➕ Crear nuevo ejercicio
          </button>
        </div>

        {showForm && (
          <form className="ej-form" onSubmit={handleSubmit}>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del ejercicio" required />
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" rows={3} />
            <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="URL de GIF/video (opcional)" />
            <div className="ej-form-actions">
              <button type="submit" className="primary-btn">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="secondary-btn">Cancelar</button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Cargando ejercicios...</p>
        ) : (
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
        )}
      </main>
    </div>
  );
}
