export async function getEjercicios() {
  await new Promise(r => setTimeout(r, 100));
  return [
    { id: "e1", nombre: "Sentadilla", grupo: "Piernas", equipamiento: "Barra" },
    { id: "e2", nombre: "Press banca", grupo: "Pecho", equipamiento: "Barra" },
  ];
}
