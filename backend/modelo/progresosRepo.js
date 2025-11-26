import { Op } from 'sequelize'
import ProgresosModel from './progresosModel.js'

class ProgresosRepo {
  #progresosModel = null
  #ready = null

  constructor() {
    this.#progresosModel = ProgresosModel.init()
    this.#ready = ProgresosModel.sync()
  }

  #ensureReady = async () => {
    await this.#ready
  }

  crear = async (progreso) => {
    await this.#ensureReady()
    const created = await this.#progresosModel.create({
      alumnoId: progreso.alumnoId,
      peso: progreso.peso ?? null,
      repeticiones: progreso.repeticiones ?? null,
      observaciones: progreso.observaciones ?? null,
      fechaRegistro: progreso.fechaRegistro
    })
    return created.get({ plain: true })
  }

  listarPorAlumno = async (alumnoId, { desde, hasta } = {}) => {
    await this.#ensureReady()
    const where = { alumnoId }
    if (desde || hasta) {
      where.fechaRegistro = {}
      if (desde) where.fechaRegistro[Op.gte] = desde
      if (hasta) where.fechaRegistro[Op.lte] = hasta
    }
    const rows = await this.#progresosModel.findAll({
      where,
      order: [['fechaRegistro', 'ASC'], ['id', 'ASC']]
    })
    return rows.map(r => r.get({ plain: true }))
  }
}

export default ProgresosRepo
