import ServicioAuth from '../servicio/auth.js'

class ControladorAuth {
    #servicio = null

    constructor() {
        this.#servicio = new ServicioAuth()
    }

    registrar = async (req, res) => {
        try {
            const resultado = await this.#servicio.registrar(req.body)
            res.status(201).json(resultado)
        } catch (error) {
            const statusCode = error.message === 'El email ya está registrado' ? 400 : 500
            res.status(statusCode).json({
                message: error.message
            })
        }
    }

    login = async (req, res) => {
        try {
            const resultado = await this.#servicio.login(req.body)
            res.json(resultado)
        } catch (error) {
            const statusCode = error.message === 'Credenciales incorrectas' ? 401 : 500
            res.status(statusCode).json({
                message: error.message
            })
        }
    }

    obtenerUsuarioActual = async (req, res) => {
        try {
            const usuario = await this.#servicio.obtenerUsuarioActual(req.usuario.id)
            res.json(usuario)
        } catch (error) {
            res.status(404).json({
                message: error.message
            })
        }
    }

    logout = async (req, res) => {
        res.json({ message: 'Logged out successfully' })
    }

    refrescarToken = async (req, res) => {
        try {
            const resultado = await this.#servicio.refrescarToken(req.usuario.id)
            res.json(resultado)
        } catch (error) {
            res.status(401).json({
                message: error.message
            })
        }
    }
}

export default ControladorAuth
