import EjerciciosModel from './ejerciciosModel.js'

class EjerciciosRepo {
    #ejerciciosModel = null
    #ready = null

    constructor() {
        this.#ejerciciosModel = EjerciciosModel.init()
        this.#ready = EjerciciosModel.sync()
    }

    #ensureReady = async () => {
        await this.#ready
    }

    crear = async ejercicio => {
        await this.#ensureReady()
        const creado = await this.#ejerciciosModel.create(ejercicio)
        return creado.get({ plain: true })
    }

    listar = async ({ entrenadorId } = {}) => {
        await this.#ensureReady()
        const where = entrenadorId ? { entrenadorId } : {}
        const rows = await this.#ejerciciosModel.findAll({
            where,
            order: [['id', 'DESC']]
        })
        return rows.map(r => r.get({ plain: true }))
    }
}

export default EjerciciosRepo
