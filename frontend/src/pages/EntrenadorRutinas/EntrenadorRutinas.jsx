import { useEffect, useMemo, useState } from "react";
import "../../App.css";
import "./EntrenadorRutinas.css";
import { useAuth } from "../../hooks/useAuth.js";
import { agregarEjercicioARutina, crearRutina, getRutinasByEntrenador } from "../../services/rutinasServices.js";
import { getEjercicios } from "../../services/ejerciciosService.js";

export default function EntrenadorRutinas() {
  const { user } = useAuth(); // { id, role, email, ... }
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ejercicios, setEjercicios] = useState([]);
  const [form, setForm] = useState({ rutinaId: "", ejercicioId: "", repeticiones: "", peso: "" });
  const [ejercicioNuevo, setEjercicioNuevo] = useState({ nombre: "", descripcion: "" });
  const [rutinaNueva, setRutinaNueva] = useState({ titulo: "", nivel: "Inicial", duracionMin: 30, objetivo: "", estado: "activa" });
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(6);


  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const [data, ejerciciosData] = await Promise.all([
        getRutinasByEntrenador(user.id),
        getEjercicios()
      ]);

      if (alive) {
        setRows(data);
        setEjercicios(ejerciciosData);
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [user?.id]);

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = term
      ? rows.filter(r =>
        r.titulo.toLowerCase().includes(term) ||
        r.objetivo.toLowerCase().includes(term) ||
        r.nivel.toLowerCase().includes(term) ||
        r.estado.toLowerCase().includes(term)
      )
      : rows;
    return base.slice(0, pageSize);
  }, [rows, search, pageSize]);

  const rutinaEjercicios = useMemo(() => {
    const map = {};
    rows.forEach(r => { map[r.id] = r.ejercicios || []; });
    return map;
  }, [rows]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRutinaChange = (e) => {
    const { name, value } = e.target;
    setRutinaNueva(prev => ({ ...prev, [name]: value }));
  };

  const handleEjercicioNuevoChange = (e) => {
    const { name, value } = e.target;
    setEjercicioNuevo(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.rutinaId || !form.ejercicioId || !form.repeticiones) return;
    const ejercicioBase = ejercicios.find(ej => ej.id === form.ejercicioId);
    if (!ejercicioBase) return;

    const payload = {
      ...ejercicioBase,
      repeticiones: form.repeticiones,
      peso: form.peso
    };

    const updated = await agregarEjercicioARutina(form.rutinaId, payload);
    if (updated) {
      setRows(prev => prev.map(r => r.id === updated.id ? { ...updated } : r));
      setForm({ rutinaId: "", ejercicioId: "", repeticiones: "", peso: "" });
    }
  };

  const handleCrearRutina = async (e) => {
    e.preventDefault();
    if (!rutinaNueva.titulo.trim()) return;
    const creada = await crearRutina({
      ...rutinaNueva,
      titulo: rutinaNueva.titulo.trim(),
      objetivo: rutinaNueva.objetivo.trim(),
      entrenadorId: user.id
    });
    setRows(prev => [creada, ...prev]);
    setRutinaNueva({ titulo: "", nivel: "Inicial", duracionMin: 30, objetivo: "", estado: "activa" });
  };

  const handleCrearEjercicio = (e) => {
    e.preventDefault();
    if (!ejercicioNuevo.nombre.trim()) return;
    const nuevo = {
      id: `ej-${Date.now()}`,
      nombre: ejercicioNuevo.nombre.trim(),
      descripcion: ejercicioNuevo.descripcion.trim(),
      videoUrl: ""
    };
    setEjercicios(prev => [nuevo, ...prev]);
    setEjercicioNuevo({ nombre: "", descripcion: "" });
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">Mis rutinas</h2>
        <p className="subtitle">
          Administrá las rutinas asignadas a tus alumnos.
        </p>

        <div className="rutinas-toolbar">
          <input
            type="search"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rutinas-search"
          />
          <div className="rutinas-meta">
            <span>{rows.length} resultados</span>
            <label>
              Mostrar
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {[3, 6, 9, 12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <p>Cargando rutinas...</p>
        ) : (
          <div className="rutinas-grid">
            {filtrados.map(r => (
              <article key={r.id} className="rutina-card" onClick={() => toggleExpand(r.id)}>
                <h3 className="rutina-title">{r.titulo}</h3>
                <p className="rutina-nivel">{r.nivel}</p>
                <div className="rutina-details">
                  <div><span>Duración</span><strong>{r.duracionMin} min</strong></div>
                  <div><span>Objetivo</span><strong>{r.objetivo}</strong></div>
                  <div><span>Estado</span><strong>{r.estado === "activa" ? "Activa" : "Pausada"}</strong></div>
                </div>
                {expandedId === r.id && (
                  <div style={{ borderTop: "1px solid #e7e7f5", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                    <p style={{ margin: "0 0 0.35rem", fontWeight: 600, color: "#4b4b6f" }}>Ejercicios</p>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#2f2f4f" }}>
                      {(rutinaEjercicios[r.id] || []).map((ej, idx) => (
                        <li key={`${r.id}-${idx}`}>
                          {ej.nombre} — {ej.repeticiones} reps{ej.peso ? ` | ${ej.peso} kg` : ""}
                        </li>
                      ))}
                      {!rutinaEjercicios[r.id]?.length && <li>Sin ejercicios aún.</li>}
                    </ul>
                  </div>
                )}
              </article>
            ))}
            {!filtrados.length && <p>No hay rutinas que coincidan.</p>}
          </div>
        )}

        <div className="rutinas-separator" />

        <div className="rutinas-panels">
          <section className="rutina-panel">
            <h3 className="rutina-panel-title">Crear rutina</h3>
            <form className="panel-form" onSubmit={handleCrearRutina}>
              <input name="titulo" value={rutinaNueva.titulo} onChange={handleRutinaChange} placeholder="Nombre de la rutina" required />
              <select name="nivel" value={rutinaNueva.nivel} onChange={handleRutinaChange}>
                <option>Inicial</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
              <input name="duracionMin" type="number" min="5" value={rutinaNueva.duracionMin} onChange={handleRutinaChange} placeholder="Duración (min)" required />
              <input name="objetivo" value={rutinaNueva.objetivo} onChange={handleRutinaChange} placeholder="Objetivo" />
              <select name="estado" value={rutinaNueva.estado} onChange={handleRutinaChange}>
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
              </select>
              <button type="submit" className="primary-btn">Crear rutina</button>
            </form>
          </section>

          <section className="rutina-panel">
            <h3 className="rutina-panel-title">Agregar ejercicio a una rutina</h3>
            <details className="panel-details">
              <summary>Agregar nuevo ejercicio al listado</summary>
              <form className="panel-form" onSubmit={handleCrearEjercicio}>
                <input name="nombre" value={ejercicioNuevo.nombre} onChange={handleEjercicioNuevoChange} placeholder="Nombre ejercicio" required />
                <input name="descripcion" value={ejercicioNuevo.descripcion} onChange={handleEjercicioNuevoChange} placeholder="Descripción (opcional)" />
                <button type="submit" className="secondary-btn">Crear ejercicio</button>
              </form>
            </details>
            <form className="panel-form" onSubmit={handleAdd}>
              <select name="rutinaId" value={form.rutinaId} onChange={handleChange} required>
                <option value="">Elegí rutina</option>
                {rows.map(r => <option key={r.id} value={r.id}>{r.titulo}</option>)}
              </select>
              <select name="ejercicioId" value={form.ejercicioId} onChange={handleChange} required>
                <option value="">Elegí ejercicio</option>
                {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
              </select>
              <input name="repeticiones" value={form.repeticiones} onChange={handleChange} placeholder="Repeticiones" required />
              <input name="peso" value={form.peso} onChange={handleChange} placeholder="Peso (kg) opcional" />
              <button type="submit" className="primary-btn">Agregar</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
