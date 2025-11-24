import express from 'express'
import { crearPlanGeneral, actualizarPlanGeneral } from '../controlador/planController.js'

class RouterPlanes {
  config = () => {
    const router = express.Router()
    // Crear plan con múltiples rutinas (opcionalmente asociado a un alumno)
    router.post('/', crearPlanGeneral)
    // Actualizar plan y sus rutinas asignadas
    router.put('/:planId', actualizarPlanGeneral)
    return router
  }
}

export default RouterPlanes
