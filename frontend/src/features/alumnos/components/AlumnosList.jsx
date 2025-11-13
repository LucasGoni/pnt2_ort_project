import { useEffect, useState } from "react";
import DataList from "@/components/DataList/DataList";
import { useAuth } from "@/hooks/useAuth";
import { getAlumnosAll, getAlumnosByEntrenador } from "../services/alumnosService";

export function AlumnosList() {
  const { user } = useAuth(); // suponemos algo como { id, role, email }
  const role = user?.role ?? "entrenador";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      let data = [];

      if (role === "admin") {
        data = await getAlumnosAll();
      } else {
        // entrenador
        data = await getAlumnosByEntrenador(user.id);
      }

      if (alive) {
        setRows(data);
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [role, user?.id]);

  const columns = [
    { key: "nombre",  header: "Nombre",  accessor: "nombre",  sortable: true },
    { key: "email",   header: "Email",   accessor: "email",   sortable: true },
    { key: "objetivo",header: "Objetivo",accessor: "objetivo" },
    {
      key: "estado",
      header: "Estado",
      accessor: "estado",
      sortable: true,
      render: (v) => v === "activo" ? "Activo" : "Pausado",
    },
    // Esta columna solo tiene sentido para admin:
    ...(role === "admin"
      ? [{
          key: "entrenador",
          header: "Entrenador",
          accessor: "entrenadorNombre",
          sortable: true,
        }]
      : []
    ),
  ];

  const actions = (row) => [
    { label: "Ver", onClick: () => console.log("Ver alumno", row) },
    { label: "Plan", onClick: () => console.log("Ver rutina de", row.nombre) },
    // Podés condicionar por rol:
    ...(role === "admin"
      ? [{ label: "Reasignar", onClick: () => console.log("Reasignar alumno", row) }]
      : []
    ),
  ];

  return (
    <section style={{ padding: 16 }}>
      <h2>Alumnos ({role})</h2>
      <DataList
        columns={columns}
        data={rows}
        loading={loading}
        actions={actions}
        searchable
      />
    </section>
  );
}
