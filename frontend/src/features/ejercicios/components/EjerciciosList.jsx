import { useEffect, useState } from "react";
import DataList from "@/components/DataList/DataList";
import { getEjercicios } from "../services/ejerciciosService";

export function EjerciciosList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    setRows(await getEjercicios());
    setLoading(false);
  })(); }, []);

  const columns = [
    { key: "nombre", header: "Ejercicio", accessor: "nombre", sortable: true },
    { key: "grupo",  header: "Grupo muscular", accessor: "grupo", sortable: true },
    { key: "eq",     header: "Equipamiento", accessor: "equipamiento", sortable: true },
  ];

  return (
    <section style={{ padding: 16 }}>
      <h2>Ejercicios</h2>
      <DataList columns={columns} data={rows} loading={loading} />
    </section>
  );
}
