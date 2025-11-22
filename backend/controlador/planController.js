import Joi from "joi";
import {
  actualizarAsignacion,
  DIA_SEMANA,
  marcarSesion,
  obtenerPlan,
  PlanError,
} from "../modelo/plan.js";

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

const handleError = (res, error) => {
  if (error instanceof PlanError) {
    return res.status(error.status ?? 400).json({ message: error.message });
  }
  console.error("[planController] error no controlado:", error);
  return res.status(500).json({ message: "Error interno del servidor" });
};

export const getPlan = (req, res) => {
  try {
    const plan = obtenerPlan(req.params.alumnoId);
    return res.json({ plan });
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

    const updatedPlan = actualizarAsignacion(req.params.alumnoId, req.body.asignacion);
    return res.json({ plan: updatedPlan });
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

    const updatedPlan = marcarSesion(req.params.alumnoId, fecha, req.body.rutinaId, req.body.done);
    return res.json({ plan: updatedPlan });
  } catch (error) {
    return handleError(res, error);
  }
};

export default {
  getPlan,
  putAsignacion,
  patchSesion,
};
