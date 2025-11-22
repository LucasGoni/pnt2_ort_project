import { Router } from "express";
import { getPlan, patchSesion, putAsignacion } from "../controlador/planController.js";

const router = Router();

router.get("/:alumnoId/plan", getPlan);
router.put("/:alumnoId/plan/asignacion", putAsignacion);
router.patch("/:alumnoId/plan/sesiones/:fecha", patchSesion);

export default router;
