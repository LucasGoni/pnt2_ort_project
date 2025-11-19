import { useEffect, useState } from "react";
import "../../App.css"; // o un CSS propio similar a HomeEntrenador
import DataList from "../../components/DataList";
import { useAuth } from "../../hooks/useAuth.js";
import { getRutinasByEntrenador } from "../../services/rutinasServices.js";

export default function EntrenadorRutinas() {
  const { user } = useAuth(); // { id, role, email, ... }
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let alive = true;

    (async () => {
        const data = await getRutinasByEntrenador(user.id);
      setLoading(true);
      console.log("Entrenador logueado (rutinas):", user);

      console.log("Rutinas del entrenador:", data);

      if (alive) {
        setRows(data);
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [user?.id]);

  const columns = [
    { key: "titulo",   header: "Título",   accessor: "titulo",   sortable: true },
    { key: "nivel",    header: "Nivel",    accessor: "nivel",    sortable: true },
    {
      key: "duracion",
      header: "Duración",
      accessor: (r) => r.duracionMin,
      sortable: true,
      render: (v) => `${v} min`,
    },
    { key: "objetivo", header: "Objetivo", accessor: "objetivo" },
    {
      key: "estado",
      header: "Estado",
      accessor: "estado",
      sortable: true,
      render: (v) => v === "activa" ? "Activa" : "Pausada",
    },
  ];

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">Mis rutinas</h2>
        <p className="subtitle">
          Administrá las rutinas asignadas a tus alumnos.
        </p>

        <DataList
          columns={columns}
          data={rows}
          loading={loading}
          searchable
        />
      </main>
    </div>
  );
}
