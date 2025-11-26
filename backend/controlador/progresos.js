import ProgresosRepo from '../modelo/progresosRepo.js'
import PlanesRepo from '../modelo/planesRepo.js'
import RutinasRepo from '../modelo/rutinasRepo.js'
import { validarToken } from '../servicio/tokenService.js'

const parseISODate = (iso) => {
  const [y, m, d] = (iso || '').split('-').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  return Number.isNaN(dt.getTime()) ? null : dt
}

const toISODate = (value) => {
  if (!value) return null
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

const fechaEnRango = (fechaISO, desde, hasta) => {
  const dt = parseISODate(fechaISO)
  if (!dt) return false
  if (desde && dt < desde) return false
  if (hasta && dt > hasta) return false
  return true
}

class ProgresosControlador {
  #repo = null
  #planesRepo = null
  #rutinasRepo = null

  constructor() {
    this.#repo = new ProgresosRepo()
    this.#planesRepo = new PlanesRepo()
    this.#rutinasRepo = new RutinasRepo()
  }

  #extraerToken = (req) => {
    const authHeader = req.headers.authorization || ''
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
    return req.body?.token || ''
  }

  #autorizarAlumno = (req, alumnoId) => {
    const payload = validarToken(this.#extraerToken(req))
    if (payload.rol === 'alumno' && String(payload.id) !== String(alumnoId)) {
      const error = new Error('No autorizado')
      error.status = 403
      throw error
    }
    return payload
  }

  #manejarError = (res, error, mensaje = 'No se pudo obtener el progreso') => {
    const status = error.status || 500
    const message = error.message || mensaje
    res.status(status).json({ message })
  }

  // Calcula sesiones y ejercicios completados en el rango solicitado.
  #obtenerStatsSesiones = async (alumnoId, { desdeDate, hastaDate }) => {
    const plan = await this.#planesRepo.obtenerPorAlumnoId(alumnoId)
    if (!plan) {
      return { sesionesCompletadas: 0, ejerciciosCompletados: 0 }
    }

    const rutinas = await this.#rutinasRepo.listarPorPlan(plan.id)
    const ejerciciosPorRutina = new Map(
      rutinas.map(r => [String(r.id), Array.isArray(r.ejercicios) ? r.ejercicios.length : 0])
    )

    const sesiones = Array.isArray(plan.sesiones) ? plan.sesiones : []
    const completadas = sesiones
      .filter(s => !!s.done)
      .filter(s => {
        const fecha = s.fecha || toISODate(s.start) || null
        if (!fecha) return false
        return fechaEnRango(fecha, desdeDate, hastaDate)
      })

    const sesionesCompletadas = completadas.length
    const ejerciciosCompletados = completadas.reduce(
      (acc, s) => acc + (ejerciciosPorRutina.get(String(s.rutinaId)) || 0),
      0
    )

    return { sesionesCompletadas, ejerciciosCompletados }
  }

  obtenerProgreso = async (req, res) => {
    try {
      const alumnoId = parseInt(req.params.alumnoId || req.params.id)
      if (!alumnoId) {
        const error = new Error('Alumno inválido')
        error.status = 400
        throw error
      }

      this.#autorizarAlumno(req, alumnoId)

      const desdeDate = parseISODate(req.query.desde)
      const hastaDate = parseISODate(req.query.hasta)
      if (desdeDate && hastaDate && hastaDate < desdeDate) {
        const error = new Error('Rango de fechas inválido')
        error.status = 400
        throw error
      }

      const registros = await this.#repo.listarPorAlumno(alumnoId, {
        desde: desdeDate ? toISODate(desdeDate) : undefined,
        hasta: hastaDate ? toISODate(hastaDate) : undefined
      })

      const seriePeso = registros
        .filter(r => r.peso !== null && r.peso !== undefined)
        .sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro))
        .map(r => ({ fecha: r.fechaRegistro, peso: r.peso }))
      const pesos = seriePeso.map(p => p.peso)

      const serieRepeticiones = registros
        .filter(r => r.repeticiones !== null && r.repeticiones !== undefined)
        .sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro))
        .map(r => ({ fecha: r.fechaRegistro, repeticiones: r.repeticiones }))

      const pesoMin = pesos.length ? Math.min(...pesos) : null
      const pesoMax = pesos.length ? Math.max(...pesos) : null
      const pesoPromedio = pesos.length
        ? Number((pesos.reduce((acc, v) => acc + v, 0) / pesos.length).toFixed(2))
        : null

      const { sesionesCompletadas, ejerciciosCompletados } = await this.#obtenerStatsSesiones(
        alumnoId,
        { desdeDate, hastaDate }
      )

      res.json({
        registros,
        resumen: {
          sesionesCompletadas,
          ejerciciosCompletados,
          pesoMin,
          pesoMax,
          pesoPromedio,
          seriePeso,
          serieRepeticiones
        }
      })
    }
    catch (error) {
      this.#manejarError(res, error)
    }
  }

  registrarProgreso = async (req, res) => {
    try {
      const alumnoId = parseInt(req.params.alumnoId || req.params.id)
      if (!alumnoId) {
        const error = new Error('Alumno inválido')
        error.status = 400
        throw error
      }

      this.#autorizarAlumno(req, alumnoId)

      const pesoValor = req.body?.peso
      const repValor = req.body?.repeticiones
      const peso = (pesoValor === undefined || pesoValor === null || pesoValor === '')
        ? null
        : Number(pesoValor)
      if (peso !== null && Number.isNaN(peso)) {
        const error = new Error('Peso inválido')
        error.status = 400
        throw error
      }

      const repeticiones = (repValor === undefined || repValor === null || repValor === '')
        ? null
        : parseInt(repValor, 10)
      if (repeticiones !== null && Number.isNaN(repeticiones)) {
        const error = new Error('Repeticiones inválidas')
        error.status = 400
        throw error
      }

      const fecha = toISODate(req.body?.fechaRegistro || new Date())
      if (!fecha) {
        const error = new Error('Fecha de registro inválida')
        error.status = 400
        throw error
      }

      const creado = await this.#repo.crear({
        alumnoId,
        peso,
        repeticiones,
        observaciones: req.body?.observaciones?.trim() || null,
        fechaRegistro: fecha
      })

      res.status(201).json(creado)
    }
    catch (error) {
      this.#manejarError(res, error, 'No se pudo registrar el progreso')
    }
  }
}

export default ProgresosControlador
