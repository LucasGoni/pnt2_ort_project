// src/services/alumnosServices.js

// Mock de alumnos asociados a distintos entrenadores.
// Más adelante podés reemplazar esto por un fetch a tu API.
const MOCK_ALUMNOS = [
  {
    id: "a1",
    nombre: "Ana Pérez",
    email: "ana.perez@fitandtrack.com",
    objetivo: "Bajar de peso",
    estado: "activo",
    entrenadorId: "coach-1",
    entrenadorNombre: "Lucía Torres",
    // si usás Vite, poné las imágenes en /public/images/...
    avatarUrl: "/images/alumnos/ana.png",
  },
  {
    id: "a2",
    nombre: "Bruno Díaz",
    email: "bruno.diaz@fitandtrack.com",
    objetivo: "Hipertrofia",
    estado: "pausado",
    entrenadorId: "coach-1",
    entrenadorNombre: "Lucía Torres",
    avatarUrl: "/images/alumnos/bruno.png",
  },
  {
    id: "a3",
    nombre: "Carla Gómez",
    email: "carla.gomez@fitandtrack.com",
    objetivo: "Fuerza",
    estado: "activo",
    entrenadorId: "coach-2",
    entrenadorNombre: "Martín Ríos",
    avatarUrl: "/images/alumnos/carla.png",
  },
];

// 🔹 Devuelve solo los alumnos del entrenador indicado
export async function getAlumnosByEntrenador(entrenadorId) {
  // simulamos una pequeña demora de red
  await new Promise((r) => setTimeout(r, 150));

  if (!entrenadorId) return [];
  return MOCK_ALUMNOS.filter((a) => a.entrenadorId === entrenadorId);
}

// 🔹 Devuelve todos los alumnos (útil para vistas de admin)
export async function getAlumnosAll() {
  await new Promise((r) => setTimeout(r, 150));
  return [...MOCK_ALUMNOS];
}
