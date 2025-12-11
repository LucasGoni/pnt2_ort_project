import AlumnosRepo from "../modelo/alumnosRepo.js";
import PlanesRepo from "../modelo/planesRepo.js";
import RutinasRepo from "../modelo/rutinasRepo.js";
import PlanAsignacionesRepo from "../modelo/planAsignacionesRepo.js";

export const calendarioEntrenador = async (req, res) => {
  try {
    const entrenadorId = req.params.entrenadorId;
    const alumnosRepo = new AlumnosRepo();
    const planesRepo = new PlanesRepo();
    const rutinasRepo = new RutinasRepo();
    const planAsignacionesRepo = new PlanAsignacionesRepo();

    const alumnos = await alumnosRepo.listarPorEntrenador(entrenadorId);
    const events = [];

    for (const alumno of alumnos) {
      const asignacion = await planAsignacionesRepo.obtenerPorAlumnoId(alumno.id);
      if (!asignacion) continue;

      const plan = await planesRepo.obtenerPorId(asignacion.planId);
      if (!plan) continue;

      const rutinasDb = await rutinasRepo.listarPorPlan(plan.id);
      const rutinasMap = new Map(rutinasDb.map((r) => [String(r.id), r]));

      (asignacion.sesiones || []).forEach((sesion) => {
        const rutina = rutinasMap.get(String(sesion.rutinaId));
        events.push({
          title: `${alumno.nombre || "Alumno"} - ${rutina?.titulo || rutina?.nombre || `Rutina ${sesion.rutinaId}`}`,
          start: sesion.start ? new Date(sesion.start) : new Date(sesion.fecha),
          end: sesion.end ? new Date(sesion.end) : new Date(sesion.fecha),
          meta: {
            alumnoId: alumno.id,
            rutinaId: sesion.rutinaId,
            done: !!sesion.done,
            planId: plan.id,
          },
        });
      });
    }

    return res.json({ events });
  } catch (error) {
    console.error("[calendarioEntrenador] error:", error);
    return res.status(500).json({ message: "No se pudo obtener el calendario del entrenador" });
  }
};

export default { calendarioEntrenador };
