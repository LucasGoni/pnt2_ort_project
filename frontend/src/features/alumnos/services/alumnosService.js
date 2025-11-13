// MOCK: imaginá que esto después pega al backend

const MOCK_ALUMNOS = [
  {
    id: "a1",
    nombre: "Ana Pérez",
    email: "ana@fit.com",
    objetivo: "Bajar de peso",
    estado: "activo",
    entrenadorId: "coach-1",
    entrenadorNombre: "Lucía Torres",
  },
  {
    id: "a2",
    nombre: "Bruno Díaz",
    email: "bruno@fit.com",
    objetivo: "Hipertrofia",
    estado: "pausado",
    entrenadorId: "coach-1",
    entrenadorNombre: "Lucía Torres",
  },
  {
    id: "a3",
    nombre: "Carla Gómez",
    email: "carla@fit.com",
    objetivo: "Fuerza",
    estado: "activo",
    entrenadorId: "coach-2",
    entrenadorNombre: "Martín Ríos",
  },
];

export async function getAlumnosByEntrenador(entrenadorId) {
  await new Promise(r => setTimeout(r, 100));
  return MOCK_ALUMNOS.filter(a => a.entrenadorId === entrenadorId);
}

export async function getAlumnosAll() {
  await new Promise(r => setTimeout(r, 100));
  return MOCK_ALUMNOS;
}
