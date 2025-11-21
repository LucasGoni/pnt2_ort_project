import { useEffect, useState } from "react";
import "../../App.css";
import DataList from "../../components/DataList"; // 👈 nuevo import (usa index.jsx)
import { useAuth } from "../../hooks/useAuth.js";
import { getAlumnosByEntrenador } from "../../services/alumnosServices.js"; // 👈 ajustá el nombre al de tu servicio real
import BackButton from "../../components/BackButton.jsx";

export default function EntrenadorAlumnos() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    // si todavía no hay user.id, no pedimos nada
    if (!user?.id) {
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    (async () => {
      setLoading(true);
      console.log("Entrenador logueado (alumnos):", user);

      try {
        const data = await getAlumnosByEntrenador(user.id);
        console.log("Alumnos del entrenador:", data);

        if (alive) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al obtener alumnos:", error);
        if (alive) {
          setRows([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const columns = [
    // 🟡 Título de la carta: nombre del alumno
    { key: "nombre", header: "Nombre", accessor: "nombre", sortable: true },

    // 🔵 Subtítulo: objetivo principal
    { key: "objetivo", header: "Objetivo", accessor: "objetivo" },

    // 🟣 Stats / atributos
    { key: "email", header: "Email", accessor: "email", sortable: true },
    {
      key: "estado",
      header: "Estado",
      accessor: "estado",
      sortable: true,
      render: (v) => (v === "activo" ? "Activo" : "Pausado"),
    },
  ];

  // Acciones en el footer de la carta
  const actions = (row) => [
    {
      label: "Ver ficha",
      onClick: () => {
        console.log("Ver ficha de alumno:", row);
        // más adelante: navigate(`/entrenador/alumnos/${row.id}`);
      },
    },
    {
      label: "Ver progreso",
      onClick: () => {
        console.log("Ver progreso de:", row.nombre);
      },
    },
  ];

  // Click a toda la carta
  const handleRowClick = (row) => {
    console.log("Click en carta de alumno:", row);
    // futuro: navegación al detalle
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <BackButton />
        <h2 className="welcome">Mis alumnos</h2>
        <p className="subtitle">
          Listado de alumnos asociados a este entrenador.
        </p>

        <DataList
          columns={columns}
          data={rows}
          loading={loading}
          searchable
          // 👇 si en tu modelo de alumno tenés, por ejemplo, avatarUrl o fotoPerfil:
          // imageAccessor="avatarUrl"
          imageAccessor={(a) => a.avatarUrl ?? "/images/alumnos/default.png"}
          actions={actions}
          onRowClick={handleRowClick}
          emptyText="Todavía no tenés alumnos asignados. ¡Prepará tus cartas para el próximo duelo! ✨"
          pageSizeOptions={[6, 12, 24]}
          initialPageSize={6}
        />
      </main>
    </div>
  );
}
