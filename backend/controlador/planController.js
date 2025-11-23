import Joi from "joi";
import {
  DIA_SEMANA,
} from "../modelo/plan.js";
import PlanesRepo from "../modelo/planesRepo.js";
import RutinasRepo from "../modelo/rutinasRepo.js";
import AlumnosRepo from "../modelo/alumnosRepo.js";

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
  alumnoId: Joi.number().optional(), // opcional para plan general
});

let planesRepo = null;
let rutinasRepo = null;
let alumnosRepo = null;

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

const handleError = (res, error) => {
  console.error("[planController] error no controlado:", error);
  return res.status(error.status || 500).json({ message: error.message || "Error interno del servidor" });
};

export const getPlan = async (req, res) => {
  try {
    const alumnoId = req.params.alumnoId;
    const alumno = await getAlumnosRepo().obtenerPorId(alumnoId);

    // preferimos el planId del alumno; si no existe, usamos el primero por alumnoId
    let plan = null;
    if (alumno?.planId) {
      plan = await getPlanesRepo().obtenerPorId(alumno.planId);
    }
    if (!plan) {
      plan = await getPlanesRepo().obtenerPorAlumnoId(alumnoId);
    }
    if (!plan) {
      const err = new Error("El alumno no tiene un plan asignado");
      err.status = 404;
      throw err;
    }

    // Enriquecemos rutinas consultando por idPlan (persistente)
    const rutinasDb = await getRutinasRepo().listarPorPlan(plan.id);
    const rutinas = rutinasDb.map((r) => ({
      id: String(r.id),
      nombre: r.titulo || r.nombre || "Rutina",
      descripcion: r.objetivo || "",
      ejercicios: r.ejercicios || [],
      idPlan: r.idPlan,
    }));

    return res.json({
      planId: plan.id,
      nombre: plan.nombre,
      objetivo: plan.objetivo,
      vigencia: {
        desde: plan.vigenciaDesde,
        hasta: plan.vigenciaHasta,
      },
      rutinas,
      asignacion: plan.asignacion,
      sesiones: plan.sesiones,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const putAsignacion = (req, res) => {
  try {
    const { error } = asignacionPayloadSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    getPlanesRepo().actualizarAsignacion(req.params.alumnoId, req.body.asignacion).then((updatedPlan) => {
      if (!updatedPlan) {
        const err = new Error("El alumno no tiene un plan asignado");
        err.status = 404;
        throw err;
      }
      return res.json({ plan: updatedPlan });
    }).catch((err) => handleError(res, err));
  } catch (error) {
    return handleError(res, error);
  }
};

export const patchSesion = (req, res) => {
  try {
    const fecha = req.params.fecha;
    const { error } = sesionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    getPlanesRepo().obtenerPorAlumnoId(req.params.alumnoId).then((plan) => {
      if (!plan) {
        const err = new Error("El alumno no tiene un plan asignado");
        err.status = 404;
        throw err;
      }
      const sesiones = Array.isArray(plan.sesiones) ? [...plan.sesiones] : [];
      const existing = sesiones.find((s) => s.fecha === fecha && String(s.rutinaId) === String(req.body.rutinaId));
      if (existing) {
        existing.done = !!req.body.done;
      } else {
        sesiones.push({ fecha, rutinaId: req.body.rutinaId, done: !!req.body.done });
      }
      return getPlanesRepo().marcarSesion(req.params.alumnoId, sesiones);
    }).then((updated) => res.json({ plan: updated }))
      .catch((err) => handleError(res, err));
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

    const planCreado = await getPlanesRepo().crearParaAlumno(alumnoId, value);
    // Vinculamos rutinas al plan recién creado
    await getRutinasRepo().asignarPlanARutinas(value.rutinas, planCreado.id);
    await getAlumnosRepo().asignarPlan(alumnoId, planCreado.id);

    res.status(201).json({ plan: planCreado });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Crea un plan general (opcionalmente asociado a un alumno) con múltiples rutinas.
 */
export const crearPlanGeneral = async (req, res) => {
  try {
    const { error, value } = crearPlanSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    let planCreado = null;
    if (value.alumnoId) {
      planCreado = await getPlanesRepo().crearParaAlumno(value.alumnoId, value);
      await getRutinasRepo().asignarPlanARutinas(value.rutinas, planCreado.id);
      await getAlumnosRepo().asignarPlan(value.alumnoId, planCreado.id);
    } else {
      // plan sin alumno asignado
      const data = { ...value, alumnoId: null };
      planCreado = await getPlanesRepo().crearParaAlumno(null, data);
      await getRutinasRepo().asignarPlanARutinas(value.rutinas, planCreado.id);
    }
    return res.status(201).json({ plan: planCreado });
  } catch (error) {
    return handleError(res, error);
  }
};

/**
 * Actualiza un plan y reasigna rutinas (uno-a-muchos).
 */
export const actualizarPlanGeneral = async (req, res) => {
  try {
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

    const updated = await getPlanesRepo().actualizarPlan(planId, value);
    return res.json({ plan: updated });
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
  actualizarPlanGeneral,
};
