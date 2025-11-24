// Datos seed básicos para que los endpoints devuelvan contenido útil
// sin depender de una base de datos todavía.
export const PLAN_SEED = {
  id: "plan-42",
  alumnoId: "42",
  nombre: "Fuerza Base",
  objetivo: "Hipertrofia principiante",
  entrenador: { id: "t7", nombre: "Sol García" },
  vigencia: { desde: "2025-03-01" },
  rutinas: [
    { id: "r1", nombre: "Full Body A", descripcion: "Entreno global" },
    { id: "r2", nombre: "Full Body B", descripcion: "Enfoque posterior" },
    { id: "r3", nombre: "Cardio HIIT", duracionMin: 30 },
  ],
  asignacion: [], // se completa con la regla por defecto
  sesiones: [
    { fecha: "2025-03-03", rutinaId: "r1", done: true },
    { fecha: "2025-03-05", rutinaId: "r2", done: false },
  ],
};

export default [PLAN_SEED];
