export async function getRutinas() {
  // simulamos una demora mínima
  await new Promise(r => setTimeout(r, 100));
  return [
    { id: "r1", titulo: "Full Body 3x", nivel: "Inicial", duracionMin: 45, creadaPor: "Lucía" },
    { id: "r2", titulo: "Push/Pull/Legs", nivel: "Intermedio", duracionMin: 60, creadaPor: "Martín" },
  ];
}
