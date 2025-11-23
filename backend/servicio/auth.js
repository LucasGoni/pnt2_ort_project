import crypto from 'crypto'
import UsuariosRepo from '../modelo/usuariosRepo.js'
import AlumnosRepo from '../modelo/alumnosRepo.js'
import { registroSchema, loginSchema } from './validaciones/auth.js'
import { crearToken, validarToken } from './tokenService.js'

class AuthServicio {
    #usuariosRepo = null
    #alumnosRepo = null

    constructor() {
        this.#usuariosRepo = new UsuariosRepo()
        this.#alumnosRepo = new AlumnosRepo()
    }

    #hashPassword = password => {
        return crypto.createHash('sha256').update(password).digest('hex')
    }

    #limpiarUsuario = usuario => {
        if (!usuario) return null
        const { password, ...resto } = usuario
        return resto
    }

    registrar = async datos => {
        const { error, value } = registroSchema.validate(datos)
        if (error) {
            const err = new Error(error.details[0].message)
            err.status = 400
            throw err
        }

        const emailNormalizado = value.email.toLowerCase()
        const existente = await this.#usuariosRepo.buscarPorEmail(emailNormalizado)
        if (existente) {
            const err = new Error('El email ya está registrado')
            err.status = 400
            throw err
        }

        const usuarioCreado = await this.#usuariosRepo.crear({
            ...value,
            email: emailNormalizado,
            password: this.#hashPassword(value.password)
        })

        const usuario = this.#limpiarUsuario(usuarioCreado)
        let alumnoId = null
        if (usuario.rol === 'alumno') {
            // Aseguramos la fila en alumnos y devolvemos alumnoId
            await this.#alumnosRepo.seedDesdeUsuarios([usuario])
            const alumnoRow = await this.#alumnosRepo.buscarPorEmail(usuario.email)
            alumnoId = alumnoRow?.id ?? null
        }

        const usuarioResponse = { ...usuario, alumnoId }
        const token = crearToken(usuarioResponse)
        return { user: usuarioResponse, token }
    }

    login = async (email, password) => {
        const { error, value } = loginSchema.validate({ email, password })
        if (error) {
            const err = new Error(error.details[0].message)
            err.status = 400
            throw err
        }

        const usuario = await this.#usuariosRepo.buscarPorEmail(value.email.toLowerCase())
        const passwordOK = usuario && usuario.password === this.#hashPassword(value.password)

        if (!passwordOK) {
            const err = new Error('Credenciales incorrectas')
            err.status = 401
            throw err
        }

        const usuarioLimpio = this.#limpiarUsuario(usuario)
        let alumnoId = null
        if (usuarioLimpio.rol === 'alumno') {
            await this.#alumnosRepo.seedDesdeUsuarios([usuarioLimpio])
            const alumnoRow = await this.#alumnosRepo.buscarPorEmail(usuarioLimpio.email)
            alumnoId = alumnoRow?.id ?? null
        }

        const usuarioResponse = { ...usuarioLimpio, alumnoId }
        const token = crearToken(usuarioResponse)
        return { user: usuarioResponse, token }
    }

    obtenerPerfil = async token => {
        const payload = validarToken(token)
        const usuario = await this.#usuariosRepo.buscarPorId(payload.id)
        if (!usuario) {
            const err = new Error('Usuario no encontrado')
            err.status = 404
            throw err
        }
        return this.#limpiarUsuario(usuario)
    }

    refresh = async token => {
        const payload = validarToken(token)
        const usuario = await this.#usuariosRepo.buscarPorId(payload.id)
        if (!usuario) {
            const err = new Error('Usuario no encontrado')
            err.status = 404
            throw err
        }
        const usuarioLimpio = this.#limpiarUsuario(usuario)
        const nuevoToken = crearToken(usuarioLimpio)
        return { user: usuarioLimpio, token: nuevoToken }
    }
}

export default AuthServicio
