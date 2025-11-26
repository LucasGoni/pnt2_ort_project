import express from 'express'
import AlumnosControlador from '../controlador/alumnos.js'
import { asignarPlan, getPlan, patchSesion, putAsignacion } from '../controlador/planController.js'
import ProgresosControlador from '../controlador/progresos.js'

class RouterAlumnos {
    #controlador = null
    #progresosControlador = null

    constructor() {
        this.#controlador = new AlumnosControlador()
        this.#progresosControlador = new ProgresosControlador()
    }

    config = () => {
        const router = express.Router()
        router.get('/', this.#controlador.listar)
        router.get('/disponibles', this.#controlador.listarDisponibles)
        router.get('/:id/rutinas', this.#controlador.rutinasAsignadas)
        router.get('/:alumnoId/plan', getPlan)
        router.put('/:alumnoId/plan/asignacion', putAsignacion)
        router.patch('/:alumnoId/plan/sesiones/:fecha', patchSesion)
        router.post('/:alumnoId/plan', asignarPlan)
        router.get('/:alumnoId/progreso', this.#progresosControlador.obtenerProgreso)
        router.post('/:alumnoId/progreso', this.#progresosControlador.registrarProgreso)
        router.post('/:id/asignar', this.#controlador.asignar)
        router.post('/:id/desasignar', this.#controlador.desasignar)
        return router
    }
}

export default RouterAlumnos
