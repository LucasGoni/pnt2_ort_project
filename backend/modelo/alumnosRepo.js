import AlumnosModel from "./alumnosModel.js";

class AlumnosRepo {
  #alumnosModel = null;
  #ready = null;

  constructor() {
    this.#alumnosModel = AlumnosModel.init();
    this.#ready = AlumnosModel.sync();
  }

  #ensureReady = async () => {
    await this.#ready;
  };

  crear = async (alumno) => {
    await this.#ensureReady();
    const created = await this.#alumnosModel.create(alumno);
    return created.get({ plain: true });
  };

  listar = async () => {
    await this.#ensureReady();
    const rows = await this.#alumnosModel.findAll({ order: [["id", "ASC"]] });
    return rows.map((r) => r.get({ plain: true }));
  };

  listarPorEntrenador = async (entrenadorId) => {
    await this.#ensureReady();
    const where = entrenadorId ? { entrenadorId } : {};
    const rows = await this.#alumnosModel.findAll({
      where,
      order: [["id", "ASC"]],
    });
    return rows.map((r) => r.get({ plain: true }));
  };

  buscarPorEmail = async (email) => {
    await this.#ensureReady();
    const alumno = await this.#alumnosModel.findOne({ where: { email } });
    return alumno ? alumno.get({ plain: true }) : null;
  };

  actualizarPorEmail = async (email, datos) => {
    await this.#ensureReady();
    await this.#alumnosModel.update(datos, { where: { email } });
    const updated = await this.#alumnosModel.findOne({ where: { email } });
    return updated ? updated.get({ plain: true }) : null;
  };

  asignarEntrenador = async (alumnoId, entrenadorId) => {
    await this.#ensureReady();
    await this.#alumnosModel.update(
      { entrenadorId },
      { where: { id: alumnoId } }
    );
    const updated = await this.#alumnosModel.findByPk(alumnoId);
    return updated ? updated.get({ plain: true }) : null;
  };

  seedDesdeUsuarios = async (usuarios) => {
    await this.#ensureReady();
    if (!Array.isArray(usuarios) || !usuarios.length) return;
    const emails = usuarios.map((u) => u.email);
    const existentes = await this.#alumnosModel.findAll({
      where: { email: emails },
    });
    const existentesMap = new Set(existentes.map((e) => e.email));

    const nuevos = usuarios
      .filter((u) => !existentesMap.has(u.email))
      .map((u) => ({
        nombre: u.nombre,
        email: u.email,
        objetivo: "",
        estado: "activo",
        entrenadorId: null,
        avatarUrl: null,
        peso: null,
        altura: null
      }));

    if (nuevos.length) {
      await this.#alumnosModel.bulkCreate(nuevos);
    }
  };

  desasignarEntrenador = async (alumnoId) => {
    await this.#ensureReady();
    await this.#alumnosModel.update(
      { entrenadorId: null },
      { where: { id: alumnoId } }
    );
    const updated = await this.#alumnosModel.findByPk(alumnoId);
    return updated ? updated.get({ plain: true }) : null;
  };
}

export default AlumnosRepo;
