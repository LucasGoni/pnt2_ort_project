import AlumnosRepo from "../modelo/alumnosRepo.js";
import PlanesRepo from "../modelo/planesRepo.js";
import RutinasRepo from "../modelo/rutinasRepo.js";
const parseISODate = (iso) => {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
};

// Utilidad local: generar sesiones futuras según asignación, preservando completadas
// (re)genera sesiones futuras de un plan, preservando completadas
const ensureSesionesEntrenador = async (plan) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const desdeRaw = parseISODate(plan.vigenciaDesde) ?? hoy;
  const desdeDate = desdeRaw < hoy ? hoy : desdeRaw;
  const hastaDate =
    parseISODate(plan.vigenciaHasta) ?? new Date(desdeDate.getTime() + 28 * 24 * 60 * 60 * 1000);

  const sesionesRaw = Array.isArray(plan.sesiones) ? [...plan.sesiones] : [];
  const byKeyAll = new Map();
  sesionesRaw.forEach((s) => {
    const key = `${s.fecha}_${s.rutinaId}`;
    const prev = byKeyAll.get(key);
    if (!prev || s.done || !prev.done) byKeyAll.set(key, s);
  });
  const sesiones = Array.from(byKeyAll.values());
  const sesionesDone = sesiones.filter((s) => !!s.done);
  const doneKeys = new Set(sesionesDone.map((s) => `${s.fecha}_${s.rutinaId}`));
  const byKey = new Map(sesiones.filter((s) => !s.done).map((s) => [`${s.fecha}_${s.rutinaId}`, s]));

  const nuevas = [];
  const asignacion = plan.asignacion || [];
  const totalDays =
    Math.floor((hastaDate.getTime() - desdeDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(desdeDate.getTime());
    d.setUTCDate(desdeDate.getUTCDate() + i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const fechaISO = `${yyyy}-${mm}-${dd}`;
    const dow = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"][d.getUTCDay()];

    asignacion.forEach((item) => {
      if (!item.dias?.includes(dow)) return;
      const key = `${fechaISO}_${item.rutinaId}`;
      if (doneKeys.has(key)) return;
      const existente = byKey.get(key);
      if (existente) {
        nuevas.push(existente);
      } else {
        const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0));
        const end = new Date(start.getTime());
        end.setUTCHours(end.getUTCHours() + 1);
        nuevas.push({
          fecha: fechaISO,
          rutinaId: item.rutinaId,
          start: start.toISOString(),
          end: end.toISOString(),
          done: false,
        });
      }
    });
  }

  plan.sesiones = [...sesionesDone, ...nuevas];
  await new PlanesRepo().actualizarPlan(plan.id, { sesiones: plan.sesiones });
  return plan.sesiones;
};

export const calendarioEntrenador = async (req, res) => {
  try {
    const entrenadorId = req.params.entrenadorId;
    const alumnosRepo = new AlumnosRepo();
    const planesRepo = new PlanesRepo();
    const rutinasRepo = new RutinasRepo();

    const alumnos = await alumnosRepo.listarPorEntrenador(entrenadorId);
    const events = [];

    for (const alumno of alumnos) {
      const plan = await planesRepo.obtenerPorAlumnoId(alumno.id);
      if (!plan) continue;
      await ensureSesionesEntrenador(plan);
      const rutinasDb = await rutinasRepo.listarPorPlan(plan.id);
      const rutinasMap = new Map(rutinasDb.map((r) => [String(r.id), r]));

      (plan.sesiones || []).forEach((sesion) => {
        const rutina = rutinasMap.get(String(sesion.rutinaId));
        events.push({
          title: `${alumno.nombre || "Alumno"} — ${rutina?.titulo || rutina?.nombre || `Rutina ${sesion.rutinaId}`}`,
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
