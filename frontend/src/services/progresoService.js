import api from "./api";

export async function getProgresoAlumno(alumnoId, { desde, hasta } = {}) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const response = await api.get(`/alumnos/${alumnoId}/progreso`, { params });
  return response.data;
}

export async function registrarProgresoAlumno(alumnoId, payload) {
  const response = await api.post(`/alumnos/${alumnoId}/progreso`, payload);
  return response.data;
}
