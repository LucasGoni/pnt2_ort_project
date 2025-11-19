// src/services/rutinasService.js

const MOCK_RUTINAS = [
  {
    id: "r1",
    titulo: "Full Body 3x",
    nivel: "Inicial",
    duracionMin: 45,
    objetivo: "Bajar de peso",
    estado: "activa",
    entrenadorId: "coach-1",
  },
  {
    id: "r2",
    titulo: "Push/Pull/Legs",
    nivel: "Intermedio",
    duracionMin: 60,
    objetivo: "Hipertrofia",
    estado: "activa",
    entrenadorId: "coach-1",
  },
  {
    id: "r3",
    titulo: "Upper/Lower",
    nivel: "Avanzado",
    duracionMin: 70,
    objetivo: "Fuerza",
    estado: "pausada",
    entrenadorId: "coach-2",
  },
];

export async function getRutinasByEntrenador(entrenadorId) {
  await new Promise(r => setTimeout(r, 150)); // simulamos delay de red
  return MOCK_RUTINAS.filter(r => r.entrenadorId === entrenadorId);
}

export async function getRutinasAll() {
  await new Promise(r => setTimeout(r, 150));
  return MOCK_RUTINAS;
}
