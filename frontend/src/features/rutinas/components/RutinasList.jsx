import { useEffect, useState } from "react";
import DataList from "@/components/DataList/DataList";
import { useAuth } from "@/hooks/useAuth";
import { getRutinas } from "../services/rutinasService";

export function RutinasList() {
  const { user } = useAuth();
  const role = user?.role ?? "entrenador";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    setRows(await getRutinas());
    setLoading(false);
  })(); }, []);

  const columns = [
    { key: "titulo", header: "Título", accessor: "titulo", sortable: true },
    { key: "nivel",  header: "Nivel", accessor: "nivel", sortable: true },
    { key: "dur",    header: "Duración", accessor: r => r.duracionMin, sortable: true, render: v => `${v} min` },
    // visible solo para admin (si más adelante aplicás role): podrías filtrar aquí
    // { key: "autor",  header: "Autor", accessor: "creadaPor", sortable: true },
  ];

  const actions = (row/*, {role}*/) => [
    { label: "Ver", onClick: () => console.log("Ver rutina", row) },
  ];

  return (
    <section style={{ padding: 16 }}>
      <h2>Rutinas ({role})</h2>
      <DataList columns={columns} data={rows} loading={loading} actions={actions} />
    </section>
  );
}
