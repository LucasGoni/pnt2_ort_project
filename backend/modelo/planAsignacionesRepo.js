import PlanAsignacionesModel from "./planAsignacionesModel.js";

const parseJson = (val, fallback) => {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch (_e) {
    return fallback;
  }
};

class PlanAsignacionesRepo {
  #model = null;
  #ready = null;

  constructor() {
    this.#model = PlanAsignacionesModel.init();
    this.#ready = PlanAsignacionesModel.sync();
  }

  #ensureReady = async () => {
    await this.#ready;
  };

  #mapRow = (row) => {
    if (!row) return null;
    const plain = row.get({ plain: true });
    return {
      ...plain,
      asignacion: parseJson(plain.asignacion, []),
      sesiones: parseJson(plain.sesiones, []),
      meta: parseJson(plain.meta, null),
    };
  };

  obtenerPorAlumnoId = async (alumnoId) => {
    await this.#ensureReady();
    const row = await this.#model.findOne({ where: { alumnoId } });
    return this.#mapRow(row);
  };

  listarPorPlan = async (planId) => {
    await this.#ensureReady();
    const rows = await this.#model.findAll({
      where: { planId },
      order: [["id", "ASC"]],
    });
    return rows.map(this.#mapRow);
  };

  crearOActualizar = async (alumnoId, planId, data = {}) => {
    await this.#ensureReady();
    const existing = await this.#model.findOne({ where: { alumnoId } });
    const payload = {
      planId,
      asignacion: JSON.stringify(data.asignacion ?? existing?.asignacion ?? []),
      sesiones: JSON.stringify(data.sesiones ?? existing?.sesiones ?? []),
      vigenciaDesde: data.vigenciaDesde ?? data.desde ?? existing?.vigenciaDesde ?? null,
      vigenciaHasta: data.vigenciaHasta ?? data.hasta ?? existing?.vigenciaHasta ?? null,
      entrenadorId: data.entrenadorId ?? existing?.entrenadorId ?? null,
      entrenadorNombre: data.entrenadorNombre ?? existing?.entrenadorNombre ?? null,
      asignadoPor: data.asignadoPor ?? existing?.asignadoPor ?? null,
      meta: data.meta
        ? JSON.stringify(data.meta)
        : existing?.meta
        ? JSON.stringify(existing.meta)
        : null,
    };

    if (existing) {
      await this.#model.update(payload, { where: { alumnoId } });
      const updated = await this.#model.findOne({ where: { alumnoId } });
      return this.#mapRow(updated);
    }

    const created = await this.#model.create({
      alumnoId,
      ...payload,
    });
    return this.#mapRow(created);
  };

  actualizarAsignacion = async (alumnoId, asignacion) => {
    await this.#ensureReady();
    await this.#model.update(
      { asignacion: JSON.stringify(asignacion) },
      { where: { alumnoId } }
    );
    const updated = await this.#model.findOne({ where: { alumnoId } });
    return this.#mapRow(updated);
  };

  actualizarSesiones = async (alumnoId, sesiones) => {
    await this.#ensureReady();
    await this.#model.update(
      { sesiones: JSON.stringify(sesiones) },
      { where: { alumnoId } }
    );
    const updated = await this.#model.findOne({ where: { alumnoId } });
    return this.#mapRow(updated);
  };

  actualizar = async (alumnoId, data = {}) => {
    await this.#ensureReady();
    const existing = await this.#model.findOne({ where: { alumnoId } });
    if (!existing) return null;
    const payload = {
      asignacion: JSON.stringify(data.asignacion ?? existing.asignacion ?? []),
      sesiones: JSON.stringify(data.sesiones ?? existing.sesiones ?? []),
      vigenciaDesde: data.vigenciaDesde ?? data.desde ?? existing.vigenciaDesde ?? null,
      vigenciaHasta: data.vigenciaHasta ?? data.hasta ?? existing.vigenciaHasta ?? null,
      entrenadorId: data.entrenadorId ?? existing.entrenadorId ?? null,
      entrenadorNombre: data.entrenadorNombre ?? existing.entrenadorNombre ?? null,
      asignadoPor: data.asignadoPor ?? existing.asignadoPor ?? null,
      meta: data.meta
        ? JSON.stringify(data.meta)
        : existing.meta
        ? JSON.stringify(existing.meta)
        : null,
      planId: data.planId ?? existing.planId,
    };
    await this.#model.update(payload, { where: { alumnoId } });
    const updated = await this.#model.findOne({ where: { alumnoId } });
    return this.#mapRow(updated);
  };

  desasignarAlumno = async (alumnoId) => {
    await this.#ensureReady();
    await this.#model.destroy({ where: { alumnoId } });
  };

  eliminarPorPlan = async (planId) => {
    await this.#ensureReady();
    await this.#model.destroy({ where: { planId } });
  };
}

export default PlanAsignacionesRepo;
