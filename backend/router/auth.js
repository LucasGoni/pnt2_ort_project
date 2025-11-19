import express from 'express'

import ControladorAuth from '../controlador/auth.js'
import ServicioAuth from '../servicio/auth.js'

class RouterAuth {
    #controlador = null

    constructor() {
        this.#controlador = new ControladorAuth()
    }

    config() {
        const router = express.Router()

        router.post('/register', this.#controlador.registrar)
        router.post('/login', this.#controlador.login)
        router.get('/me', this.#verificarToken, this.#controlador.obtenerUsuarioActual)
        router.post('/logout', this.#verificarToken, this.#controlador.logout)
        router.post('/refresh', this.#verificarToken, this.#controlador.refrescarToken)

        return router
    }

    #verificarToken = (req, res, next) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token no proporcionado' })
        }

        const token = authHeader.split(' ')[1]

        try {
            const servicio = new ServicioAuth()
            const decoded = servicio.verificarToken(token)
            req.usuario = decoded
            next()
        } catch (error) {
            return res.status(401).json({ message: error.message })
        }
    }
}

export default RouterAuth
