class UsuariosMem {
    #usuarios = []
    #nextId = 1

    obtenerUsuarios = async () => {
        return this.#usuarios
    }

    obtenerUsuarioPorId = async id => {
        return this.#usuarios.find(u => u.id === id) || null
    }

    obtenerUsuarioPorEmail = async email => {
        return this.#usuarios.find(u => u.email === email) || null
    }

    guardarUsuario = async usuario => {
        const nuevoUsuario = {
            id: this.#nextId++,
            ...usuario,
            createdAt: new Date().toISOString()
        }
        this.#usuarios.push(nuevoUsuario)
        return nuevoUsuario
    }

    actualizarUsuario = async (id, datos) => {
        const index = this.#usuarios.findIndex(u => u.id === id)
        if (index === -1) return null

        this.#usuarios[index] = {
            ...this.#usuarios[index],
            ...datos,
            updatedAt: new Date().toISOString()
        }
        return this.#usuarios[index]
    }

    borrarUsuario = async id => {
        const index = this.#usuarios.findIndex(u => u.id === id)
        if (index === -1) return null

        const [usuarioBorrado] = this.#usuarios.splice(index, 1)
        return usuarioBorrado
    }
}

export default UsuariosMem
