import Joi from 'joi'

export const validarLogin = datos => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    })

    const { error } = schema.validate(datos)
    if (error) {
        return { result: false, error }
    }
    return { result: true }
}

export const validarRegister = datos => {
    const schema = Joi.object({
        nombre: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        rol: Joi.string().valid('alumno', 'entrenador').required()
    })

    const { error } = schema.validate(datos)
    if (error) {
        return { result: false, error }
    }
    return { result: true }
}
