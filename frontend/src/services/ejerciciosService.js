import api from "./api";

export async function getEjercicios() {
  const response = await api.get("/ejercicios");
  return response.data;
}

export async function crearEjercicio(ejercicio) {
  const response = await api.post("/ejercicios", ejercicio);
  return response.data;
}
