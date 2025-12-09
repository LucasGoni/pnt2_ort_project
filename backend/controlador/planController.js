import Joi from "joi";
import {
  DIA_SEMANA,
} from "../modelo/plan.js";
import PlanesRepo from "../modelo/planesRepo.js";
import RutinasRepo from "../modelo/rutinasRepo.js";
import AlumnosRepo from "../modelo/alumnosRepo.js";
import UsuariosRepo from "../modelo/usuariosRepo.js";
import PlanAsignacionesRepo from "../modelo/planAsignacionesRepo.js";
import { validarToken } from "../servicio/tokenService.js";

const asignacionPayloadSchema = Joi.object({
  asignacion: Joi.array()
    .items(
      Joi.object({
        rutinaId: Joi.string().required(),
        dias: Joi.array().items(Joi.string().valid(...DIA_SEMANA)).min(1).required(),
        orden: Joi.number().integer().min(1).optional(),
      })
    )
    .required(),
});

const sesionSchema = Joi.object({
  rutinaId: Joi.string().required(),
  done: Joi.boolean().required(),
  start: Joi.string().optional(),
  end: Joi.string().optional(),
  feeling: Joi.string().optional(),
});

const crearPlanSchema = Joi.object({
  nombre: Joi.string().required(),
  objetivo: Joi.string().allow("", null),
  entrenadorId: Joi.number().allow(null),
  entrenadorNombre: Joi.string().allow("", null),
  vigencia: Joi.object({
    desde: Joi.string().allow("", null),
    hasta: Joi.string().allow("", null),
  }).allow(null),
  rutinas: Joi.array()
    .items(Joi.alternatives(Joi.number(), Joi.string(), Joi.object()))
    .min(1)
    .required(),
  asignacion: Joi.array().default([]),
  sesiones: Joi.array().default([]),
  meta: Joi.any().optional(),
  alumnoId: Joi.number().allow(null).optional(), 
});

let planesRepo = null;
let rutinasRepo = null;
let alumnosRepo = null;
let usuariosRepo = null;
let planAsignacionesRepo = null;

const extraerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return req.body?.token || "";
};

const validarEntrenadorOAdmin = (req) => {
  const token = extraerToken(req);
  const payload = validarToken(token);
  if (payload.rol !== "entrenador" && payload.rol !== "admin") {
    const err = new Error("No autorizado");
    err.status = 403;
    throw err;
  }
  return payload;
};

const getPlanesRepo = () => {
  if (!planesRepo) planesRepo = new PlanesRepo();
  return planesRepo;
};

const getRutinasRepo = () => {
  if (!rutinasRepo) rutinasRepo = new RutinasRepo();
  return rutinasRepo;
};

const getAlumnosRepo = () => {
  if (!alumnosRepo) alumnosRepo = new AlumnosRepo();
  return alumnosRepo;
};

const getUsuariosRepo = () => {
  if (!usuariosRepo) usuariosRepo = new UsuariosRepo();
  return usuariosRepo;
};

const getPlanAsignacionesRepo = () => {
  if (!planAsignacionesRepo) planAsignacionesRepo = new PlanAsignacionesRepo();
  return planAsignacionesRepo;
};

const handleError = (res, error) => {
  console.error("[planController] error no controlado:", error);
  return res.status(error.status || 500).json({ message: error.message || "Error interno del servidor" });
};

const parseISODate = (iso) => {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
};

const cargarPlanYAsignacionAlumno = async (alumnoId) => {
  const alumno = await getAlumnosRepo().obtenerPorId(alumnoId);
  if (!alumno) {
    const err = new Error("Alumno no encontrado");
    err.status = 404;
    throw err;
  }

  const asignRepo = getPlanAsignacionesRepo();
  let asignacion = await asignRepo.obtenerPorAlumnoId(alumnoId);

  let plan = null;
  if (asignacion?.planId) {
    plan = await getPlanesRepo().obtenerPorId(asignacion.planId);
  }
  if (!plan && alumno?.planId) {
    plan = await getPlanesRepo().obtenerPorId(alumno.planId);
  }
  if (!plan) {
    // Compatibilidad: si existia un plan guardado con alumnoId, lo usamos para generar la asignacion.
    plan = await getPlanesRepo().obtenerPorAlumnoId(alumnoId);
  }

  if (!plan) {
    const err = new Error("El alumno no tiene un plan asignado");
    err.status = 404;
    throw err;
  }

  if (!asignacion) {
    asignacion = await asignRepo.crearOActualizar(alumnoId, plan.id, {
      asignacion: plan.asignacion || [],
      sesiones: plan.sesiones || [],
      vigenciaDesde: plan.vigenciaDesde || null,
      vigenciaHasta: plan.vigenciaHasta || null,
      entrenadorId: plan.entrenadorId ?? alumno?.entrenadorId ?? null,
      entrenadorNombre: plan.entrenadorNombre ?? null,
      meta: plan.meta ?? null,
    });
  } else if (plan?.id && String(asignacion.planId) !== String(plan.id)) {
    asignacion = await asignRepo.crearOActualizar(alumnoId, plan.id, asignacion);
  }

  if (!alumno.planId || String(alumno.planId) !== String(plan.id)) {
    await getAlumnosRepo().asignarPlan(alumnoId, plan.id);
  }

  return { alumno, plan, asignacion };
};

const armarRespuestaPlan = async (plan, asignacion, alumno) => {
  const vigenciaDesde = asignacion?.vigenciaDesde ?? plan?.vigenciaDesde ?? null;
  const vigenciaHasta = asignacion?.vigenciaHasta ?? plan?.vigenciaHasta ?? null;

  const entrenadorId = asignacion?.entrenadorId ?? plan?.entrenadorId ?? alumno?.entrenadorId ?? null;
  let entrenadorNombre = asignacion?.entrenadorNombre ?? plan?.entrenadorNombre ?? null;
  if (!entrenadorNombre && entrenadorId) {
    const entrenador = await getUsuariosRepo().buscarPorId(entrenadorId);
    entrenadorNombre = entrenador?.nombre || entrenador?.email || null;
  }

  const rutinasDb = await getRutinasRepo().listarPorPlan(plan.id);
  const rutinas = rutinasDb.map((r) => ({
    id: String(r.id),
    nombre: r.titulo || r.nombre || "Rutina",
    descripcion: r.objetivo || "",
    ejercicios: r.ejercicios || [],
    idPlan: r.idPlan,
  }));

  return {
    planId: plan.id,
    nombre: plan.nombre,
    objetivo: plan.objetivo,
    vigencia: {
      desde: vigenciaDesde,
      hasta: vigenciaHasta,
    },
    entrenadorId,
    entrenadorNombre,
    entrenador: entrenadorNombre ? { id: entrenadorId, nombre: entrenadorNombre } : null,
    rutinas,
    asignacion: asignacion?.asignacion ?? [],
    sesiones: asignacion?.sesiones ?? [],
  };
};

const startOfWeekMonday = (date) => {
  const d = new Date(date);
  const day = d.getUTCDay(); 
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const ensureSesiones = async (plan, asignacionPlan) => {
  if (!asignacionPlan) return [];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const desdeRaw = parseISODate(asignacionPlan.vigenciaDesde || plan.vigenciaDesde) ?? hoy;
  const desdeDate = desdeRaw < hoy ? hoy : desdeRaw;
  const hastaDate =
    parseISODate(asignacionPlan.vigenciaHasta || plan.vigenciaHasta) ??
    new Date(desdeDate.getTime() + 28 * 24 * 60 * 60 * 1000); 

  const sesionesRaw = Array.isArray(asignacionPlan.sesiones) ? [...asignacionPlan.sesiones] : [];
  const byKeyAll = new Map();
  sesionesRaw.forEach((s) => {
    const key = `${s.fecha}_${s.rutinaId}`;
    const prev = byKeyAll.get(key);
    if (!prev || s.done || !prev.done) {
      byKeyAll.set(key, s);
    }
  });

  const sesiones = Array.from(byKeyAll.values());
  const sesionesDone = sesiones.filter((s) => !!s.done); 
  const doneKeys = new Set(sesionesDone.map((s) => `${s.fecha}_${s.rutinaId}`));
  const byKey = new Map(sesiones.filter((s) => !s.done).map((s) => [`${s.fecha}_${s.rutinaId}`, s]));
  const nuevas = [];

  const asignacion =
    (Array.isArray(asignacionPlan.asignacion) && asignacionPlan.asignacion.length
      ? asignacionPlan.asignacion
      : plan.asignacion) || [];

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
      const existente = byKey.get(key);
      if (doneKeys.has(key)) {
        return;
      }
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
          feeling: null,
        });
      }
    });
  }

  asignacionPlan.sesiones = [...sesionesDone, ...nuevas];
  await getPlanAsignacionesRepo().actualizarSesiones(asignacionPlan.alumnoId, asignacionPlan.sesiones);

  return asignacionPlan.sesiones || [];
};

export const getPlan = async (req, res) => {
  try {
    const alumnoId = req.params.alumnoId;
    const { alumno, plan, asignacion } = await cargarPlanYAsignacionAlumno(alumnoId);

    await ensureSesiones(plan, asignacion);
    const asignacionActualizada = await getPlanAsignacionesRepo().obtenerPorAlumnoId(alumnoId);
    const response = await armarRespuestaPlan(plan, asignacionActualizada, alumno);

    return res.json(response);
  } catch (error) {
    return handleError(res, error);
  }
};

export const putAsignacion = async (req, res) => {
  try {
    const { error } = asignacionPayloadSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const alumnoId = req.params.alumnoId;
    const { alumno, plan } = await cargarPlanYAsignacionAlumno(alumnoId);

    const updatedAsignacion = await getPlanAsignacionesRepo().actualizarAsignacion(alumnoId, req.body.asignacion);
    await ensureSesiones(plan, updatedAsignacion);
    const asignacionFinal = await getPlanAsignacionesRepo().obtenerPorAlumnoId(alumnoId);
    const response = await armarRespuestaPlan(plan, asignacionFinal, alumno);

    return res.json({ plan: response });
  } catch (error) {
    return handleError(res, error);
  }
};

export const patchSesion = async (req, res) => {
  try {
    const fecha = req.params.fecha;
    const { error } = sesionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const alumnoId = req.params.alumnoId;
    const { alumno, plan, asignacion } = await cargarPlanYAsignacionAlumno(alumnoId);
    const sesiones = Array.isArray(asignacion?.sesiones) ? [...asignacion.sesiones] : [];
    const existing = sesiones.find(
      (s) => s.fecha === fecha && String(s.rutinaId) === String(req.body.rutinaId)
    );
    const start = req.body.start || existing?.start;
    const end = req.body.end || existing?.end;
    const feeling = typeof req.body.feeling !== 'undefined' ? req.body.feeling : existing?.feeling;
    if (existing) {
      existing.done = !!req.body.done;
      if (start) existing.start = start;
      if (end) existing.end = end;
      existing.feeling = feeling;
    } else {
      sesiones.push({
        fecha,
        rutinaId: req.body.rutinaId,
        done: !!req.body.done,
        start,
        end,
        feeling: feeling ?? null,
      });
    }
    const updatedAsignacion = await getPlanAsignacionesRepo().actualizarSesiones(alumnoId, sesiones);
    await ensureSesiones(plan, updatedAsignacion);
    const asignacionFinal = await getPlanAsignacionesRepo().obtenerPorAlumnoId(alumnoId);
    const response = await armarRespuestaPlan(plan, asignacionFinal, alumno);
    return res.json({ plan: response });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Asigna un plan a un alumno y persiste: crea el plan y actualiza alumno.planId.
 */
export const asignarPlan = async (req, res) => {
  try {
    const alumnoId = req.params.alumnoId;
    const { error, value } = crearPlanSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const planData = { ...value, alumnoId: null, asignaciones: [] };
    const planCreado = await getPlanesRepo().crearParaAlumno(null, planData);
    await getRutinasRepo().asignarPlanARutinas(value.rutinas, planCreado.id);

    let asignacion = await getPlanAsignacionesRepo().crearOActualizar(alumnoId, planCreado.id, {
      asignacion: value.asignacion || [],
      sesiones: value.sesiones || [],
      vigenciaDesde: value.vigencia?.desde ?? value.vigenciaDesde ?? null,
      vigenciaHasta: value.vigencia?.hasta ?? value.vigenciaHasta ?? null,
      entrenadorId: value.entrenadorId ?? null,
      entrenadorNombre: value.entrenadorNombre ?? null,
      meta: value.meta ?? null,
    });

    await ensureSesiones(planCreado, asignacion);
    asignacion = await getPlanAsignacionesRepo().obtenerPorAlumnoId(alumnoId);
    await getAlumnosRepo().asignarPlan(alumnoId, planCreado.id);

    const alumno = await getAlumnosRepo().obtenerPorId(alumnoId);
    const response = await armarRespuestaPlan(planCreado, asignacion, alumno);

    res.status(201).json({ plan: response });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Crea un plan general (opcionalmente asociado a un alumno) con multiples rutinas.
 */
export const crearPlanGeneral = async (req, res) => {
  try {
    validarEntrenadorOAdmin(req);
    const { error, value } = crearPlanSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    // plan base sin alumno asignado
    const data = { ...value, alumnoId: null, asignaciones: [] };
    const planCreado = await getPlanesRepo().crearParaAlumno(null, data);
    await getRutinasRepo().asignarPlanARutinas(value.rutinas, planCreado.id);
    return res.status(201).json({ plan: planCreado });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Lista todos los planes (con o sin alumno asignado) con rutinas vinculadas.
 */
export const listarPlanesGeneral = async (_req, res) => {
  try {
    const planes = await getPlanesRepo().listarTodos();
    const planesConRutinas = await Promise.all(
      planes.map(async (plan) => {
        const rutinas = await getRutinasRepo().listarPorPlan(plan.id);
        const asignaciones = await getPlanAsignacionesRepo().listarPorPlan(plan.id);
        const asignacionesEnriquecidas = await Promise.all(
          asignaciones.map(async (asig) => {
            await ensureSesiones(plan, asig);
            const asignacionActual = await getPlanAsignacionesRepo().obtenerPorAlumnoId(asig.alumnoId);
            const alumno = await getAlumnosRepo().obtenerPorId(asig.alumnoId);
            return {
              ...asignacionActual,
              alumnoNombre: alumno?.nombre || asignacionActual?.alumnoNombre || `Alumno ${asig.alumnoId}`,
              desde: asignacionActual?.vigenciaDesde ?? null,
              hasta: asignacionActual?.vigenciaHasta ?? null,
            };
          })
        );
        return {
          ...plan,
          asignaciones: asignacionesEnriquecidas,
          rutinas: rutinas.map((r) => ({
            id: r.id,
            titulo: r.titulo || r.nombre || "Rutina",
            nivel: r.nivel || "",
            objetivo: r.objetivo || "",
          })),
        };
      })
    );
    return res.json({ planes: planesConRutinas });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Agrega una asignacion de alumno/vigencia a un plan base.
 */
export const agregarAsignacionPlan = async (req, res) => {
  try {
    const payload = validarEntrenadorOAdmin(req);
    const planId = req.params.planId;
    const body = req.body || {};
    const alumnoId = parseInt(body.alumnoId);
    if (!alumnoId) {
      const err = new Error("alumnoId es obligatorio");
      err.status = 400;
      throw err;
    }
    const plan = await getPlanesRepo().obtenerPorId(planId);
    if (!plan) {
      const err = new Error("Plan no encontrado");
      err.status = 404;
      throw err;
    }
    const alumno = await getAlumnosRepo().obtenerPorId(alumnoId);
    if (!alumno) {
      const err = new Error("Alumno no encontrado");
      err.status = 404;
      throw err;
    }
    if (alumno.entrenadorId && alumno.entrenadorId !== payload.id) {
      const err = new Error("No podes asignar planes a un alumno de otro entrenador");
      err.status = 403;
      throw err;
    }
    // actualizamos planId del alumno para reflejar asignacion
    await getAlumnosRepo().asignarPlan(alumnoId, planId);

    const asignacionCreada = await getPlanAsignacionesRepo().crearOActualizar(alumnoId, planId, {
      asignacion: plan.asignacion || [],
      sesiones: [],
      vigenciaDesde: body.vigencia?.desde || null,
      vigenciaHasta: body.vigencia?.hasta || null,
      entrenadorId: plan.entrenadorId ?? alumno?.entrenadorId ?? payload.id ?? null,
      entrenadorNombre: plan.entrenadorNombre ?? null,
      asignadoPor: payload.id,
      meta: plan.meta ?? null,
    });

    await ensureSesiones(plan, asignacionCreada);

    const asignaciones = await getPlanAsignacionesRepo().listarPorPlan(planId);
    const asignacionesEnriquecidas = await Promise.all(
      asignaciones.map(async (asig) => {
        const al = await getAlumnosRepo().obtenerPorId(asig.alumnoId);
        return {
          ...asig,
          alumnoNombre: al?.nombre || asig.alumnoNombre || `Alumno ${asig.alumnoId}`,
          desde: asig.vigenciaDesde ?? null,
          hasta: asig.vigenciaHasta ?? null,
        };
      })
    );
    const respuestaPlan = { ...plan, asignaciones: asignacionesEnriquecidas };
    return res.status(201).json({ plan: respuestaPlan });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Actualiza un plan y reasigna rutinas (uno-a-muchos).
 */
export const actualizarPlanGeneral = async (req, res) => {
  try {
    validarEntrenadorOAdmin(req);
    const planId = req.params.planId;
    const body = req.body || {};
    const { error, value } = crearPlanSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const plan = await getPlanesRepo().obtenerPorId(planId);
    if (!plan) {
      const err = new Error("Plan no encontrado");
      err.status = 404;
      throw err;
    }

    // Desasociamos rutinas anteriores y asignamos las nuevas
    await getRutinasRepo().limpiarPlan(planId);
    await getRutinasRepo().asignarPlanARutinas(value.rutinas, planId);

    const asignaciones = await getPlanAsignacionesRepo().listarPorPlan(planId);
    const updated = await getPlanesRepo().actualizarPlan(planId, { ...value, asignaciones });
    return res.json({ plan: { ...updated, asignaciones } });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Elimina un plan, desasigna rutinas y limpia el planId en alumnos.
 */
export const eliminarPlanGeneral = async (req, res) => {
  try {
    validarEntrenadorOAdmin(req);
    const planId = req.params.planId;
    const plan = await getPlanesRepo().obtenerPorId(planId);
    if (!plan) {
      const err = new Error("Plan no encontrado");
      err.status = 404;
      throw err;
    }

    await getRutinasRepo().limpiarPlan(planId);
    await getAlumnosRepo().desasignarPorPlan(planId);
    await getPlanAsignacionesRepo().eliminarPorPlan(planId);
    await getPlanesRepo().eliminarPlan(planId);

    return res.json({ message: "Plan eliminado" });
  } catch (error) {
    return handleError(res, error);
  }
};

export default {
  getPlan,
  putAsignacion,
  patchSesion,
  asignarPlan,
  crearPlanGeneral,
  listarPlanesGeneral,
  actualizarPlanGeneral,
  eliminarPlanGeneral,
};
