// Lista de ejercicios del entrenador. Arranca vacía y se va llenando con lo que crean en la UI.
const MOCK_EJERCICIOS = []

export async function getEjercicios() {
  await new Promise((r) => setTimeout(r, 120))
  return [...MOCK_EJERCICIOS]
}

export async function crearEjercicio(ejercicio) {
  const nuevo = { id: `ej-${Date.now()}`, ...ejercicio }
  MOCK_EJERCICIOS.unshift(nuevo)
  return nuevo
}
