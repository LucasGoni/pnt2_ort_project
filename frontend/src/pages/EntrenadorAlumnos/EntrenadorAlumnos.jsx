import { useEffect, useState } from "react";
import "../../App.css"; // o un CSS propio tipo ./EntrenadorAlumnos.css
import DataList from "../../components/DataList/DataList.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getAlumnosByEntrenador } from "../../services/alumnosService.js";

export default function EntrenadorAlumnos() {
  const { user } = useAuth(); // esperamos algo como { id, role, email }
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      console.log("Entrenador logueado:", user);

      const data = await getAlumnosByEntrenador(user.id);
      console.log("Alumnos del entrenador:", data);

      if (alive) {
        setRows(data);
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [user?.id]);

  const columns = [
    { key: "nombre",   header: "Nombre",   accessor: "nombre",   sortable: true },
    { key: "email",    header: "Email",    accessor: "email",    sortable: true },
    { key: "objetivo", header: "Objetivo", accessor: "objetivo" },
    {
      key: "estado",
      header: "Estado",
      accessor: "estado",
      sortable: true,
      render: (v) => v === "activo" ? "Activo" : "Pausado",
    },
  ];

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">Mis alumnos</h2>
        <p className="subtitle">Listado de alumnos asociados a este entrenador.</p>

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
