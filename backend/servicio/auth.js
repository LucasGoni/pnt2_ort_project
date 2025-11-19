import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import config from '../config.js'
import UsuariosFactory from '../modelo/DAOs/usuariosFactory.js'
import { validarLogin, validarRegister } from './validaciones/auth.js'

class ServicioAuth {
    #modelo = null

    constructor() {
        this.#modelo = UsuariosFactory.get(config.MODO_PERSISTENCIA)
    }

    registrar = async datos => {
        const validacion = validarRegister(datos)
        if (!validacion.result) {
            throw new Error(validacion.error.details[0].message)
        }

        const usuarioExistente = await this.#modelo.obtenerUsuarioPorEmail(datos.email)
        if (usuarioExistente) {
            throw new Error('El email ya está registrado')
        }

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(datos.password, salt)

        const nuevoUsuario = await this.#modelo.guardarUsuario({
            nombre: datos.nombre,
            email: datos.email,
            password: passwordHash,
            rol: datos.rol
        })

        const token = this.#generarToken(nuevoUsuario)
        const usuario = this.#limpiarUsuario(nuevoUsuario)

        return { token, user: usuario }
    }

    login = async datos => {
        const validacion = validarLogin(datos)
        if (!validacion.result) {
            throw new Error(validacion.error.details[0].message)
        }

        const usuario = await this.#modelo.obtenerUsuarioPorEmail(datos.email)
        if (!usuario) {
            throw new Error('Credenciales incorrectas')
        }

        const passwordValido = await bcrypt.compare(datos.password, usuario.password)
        if (!passwordValido) {
            throw new Error('Credenciales incorrectas')
        }

        const token = this.#generarToken(usuario)
        const usuarioLimpio = this.#limpiarUsuario(usuario)

        return { token, user: usuarioLimpio }
    }

    obtenerUsuarioActual = async id => {
        const usuario = await this.#modelo.obtenerUsuarioPorId(id)
        if (!usuario) {
            throw new Error('Usuario no encontrado')
        }
        return this.#limpiarUsuario(usuario)
    }

    refrescarToken = async id => {
        const usuario = await this.#modelo.obtenerUsuarioPorId(id)
        if (!usuario) {
            throw new Error('Usuario no encontrado')
        }

        const token = this.#generarToken(usuario)
        const usuarioLimpio = this.#limpiarUsuario(usuario)

        return { token, user: usuarioLimpio }
    }

    verificarToken = token => {
        try {
            return jwt.verify(token, config.JWT_SECRET)
        } catch (error) {
            throw new Error('Token inválido o expirado')
        }
    }

    #generarToken = usuario => {
        return jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        )
    }

    #limpiarUsuario = usuario => {
        const { password, ...usuarioSinPassword } = usuario
        return usuarioSinPassword
    }
}

export default ServicioAuth
