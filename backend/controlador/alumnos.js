import { validarToken } from '../servicio/tokenService.js'
import AlumnosRepo from '../modelo/alumnosRepo.js'
import UsuariosRepo from '../modelo/usuariosRepo.js'

class AlumnosControlador {
    #repo = null
    #usuariosRepo = null

    constructor() {
        this.#repo = new AlumnosRepo()
        this.#usuariosRepo = new UsuariosRepo()
    }

    #manejarError = (res, error, mensaje = 'Error al obtener alumnos') => {
        const status = error.status || 500
        const message = error.message || mensaje
        res.status(status).json({ message })
    }

    #extraerToken = req => {
        const authHeader = req.headers.authorization || ''
        if (authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7)
        }
        return req.body?.token || ''
    }

    listar = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            const usuariosAlumnos = await this.#usuariosRepo.listarPorRol('alumno')
            await this.#repo.seedDesdeUsuarios(usuariosAlumnos)

            const includeUnassigned = req.query.includeUnassigned === 'true'

            const entrenadorId = (!includeUnassigned && payload.rol === 'entrenador')
                ? (req.query.entrenadorId ? parseInt(req.query.entrenadorId) : payload.id)
                : undefined

            const data = await this.#repo.listarPorEntrenador(entrenadorId)
            res.json(data)
        }
        catch (error) {
            this.#manejarError(res, error)
        }
    }

    listarDisponibles = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const usuariosAlumnos = await this.#usuariosRepo.listarPorRol('alumno')
            await this.#repo.seedDesdeUsuarios(usuariosAlumnos)

            const data = await this.#repo.listarPorEntrenador(null)
            res.json(data)
        }
        catch (error) {
            this.#manejarError(res, error)
        }
    }

    asignar = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const alumnoId = parseInt(req.params.id)
            if (!alumnoId) {
                const error = new Error('Alumno inválido')
                error.status = 400
                throw error
            }
            const entrenadorId = payload.id
            const usuariosAlumnos = await this.#usuariosRepo.listarPorRol('alumno')
            await this.#repo.seedDesdeUsuarios(usuariosAlumnos)

            const updated = await this.#repo.asignarEntrenador(alumnoId, entrenadorId)
            if (!updated) {
                const error = new Error('Alumno no encontrado')
                error.status = 404
                throw error
            }
            res.json(updated)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo asignar alumno')
        }
    }

    desasignar = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const alumnoId = parseInt(req.params.id)
            if (!alumnoId) {
                const error = new Error('Alumno inválido')
                error.status = 400
                throw error
            }

            const updated = await this.#repo.desasignarEntrenador(alumnoId)
            if (!updated) {
                const error = new Error('Alumno no encontrado')
                error.status = 404
                throw error
            }
            res.json(updated)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo desasignar alumno')
        }
    }
}

export default AlumnosControlador
