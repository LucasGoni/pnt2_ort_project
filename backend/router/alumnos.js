import express from 'express'
import AlumnosControlador from '../controlador/alumnos.js'

class RouterAlumnos {
    #controlador = null

    constructor() {
        this.#controlador = new AlumnosControlador()
    }

    config = () => {
        const router = express.Router()
        router.get('/', this.#controlador.listar)
        router.get('/disponibles', this.#controlador.listarDisponibles)
        router.post('/:id/asignar', this.#controlador.asignar)
        router.post('/:id/desasignar', this.#controlador.desasignar)
        return router
    }
}

export default RouterAlumnos
