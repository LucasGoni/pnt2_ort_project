// src/services/rutinasService.js

const MOCK_RUTINAS = []; // Comienza vacío, el entrenador crea todo

export async function getRutinasByEntrenador(entrenadorId) {
  await new Promise(r => setTimeout(r, 150)); // simulamos delay de red
  return MOCK_RUTINAS.filter(r => r.entrenadorId === entrenadorId);
}

export async function getRutinasAll() {
  await new Promise(r => setTimeout(r, 150));
  return MOCK_RUTINAS;
}

export async function crearRutina(rutina) {
  const nueva = {
    id: `r-${Date.now()}`,
    ...rutina,
    ejercicios: rutina.ejercicios || []
  };
  MOCK_RUTINAS.push(nueva);
  return nueva;
}

export async function agregarEjercicioARutina(rutinaId, ejercicio) {
  const rutina = MOCK_RUTINAS.find(r => r.id === rutinaId);
  if (!rutina) return null;
  rutina.ejercicios = rutina.ejercicios || [];
  rutina.ejercicios.push(ejercicio);
  return rutina;
}
