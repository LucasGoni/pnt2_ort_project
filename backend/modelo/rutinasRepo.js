import RutinasModel from './rutinasModel.js'

class RutinasRepo {
    #rutinasModel = null
    #ready = null

    constructor() {
        this.#rutinasModel = RutinasModel.init()
        this.#ready = RutinasModel.sync()
    }

    #ensureReady = async () => {
        await this.#ready
    }

    #mapRow = row => {
        if (!row) return null
        const plain = row.get({ plain: true })
        let ejercicios = []
        try {
            ejercicios = plain.ejercicios ? JSON.parse(plain.ejercicios) : []
        } catch (_e) {
            ejercicios = []
        }
        return {
            ...plain,
            ejercicios
        }
    }

    crear = async rutina => {
        await this.#ensureReady()
        const creada = await this.#rutinasModel.create({
            ...rutina,
            ejercicios: JSON.stringify(rutina.ejercicios || [])
        })
        return this.#mapRow(creada)
    }

    listar = async ({ entrenadorId } = {}) => {
        await this.#ensureReady()
        const where = entrenadorId ? { entrenadorId } : {}
        const rows = await this.#rutinasModel.findAll({
            where,
            order: [['id', 'DESC']]
        })
        return rows.map(this.#mapRow)
    }

    agregarEjercicio = async (rutinaId, ejercicio) => {
        await this.#ensureReady()
        const rutina = await this.#rutinasModel.findByPk(rutinaId)
        if (!rutina) return null

        const ejercicios = rutina.ejercicios ? JSON.parse(rutina.ejercicios) : []
        ejercicios.push(ejercicio)

        await this.#rutinasModel.update(
            { ejercicios: JSON.stringify(ejercicios) },
            { where: { id: rutinaId } }
        )

        const updated = await this.#rutinasModel.findByPk(rutinaId)
        return this.#mapRow(updated)
    }
}

export default RutinasRepo
