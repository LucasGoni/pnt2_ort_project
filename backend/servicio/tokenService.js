import crypto from 'crypto'
import config from '../config.js'

const buildSignature = (headerB64, payloadB64) => {
    return crypto
        .createHmac('sha256', config.TOKEN_SECRET)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64')
}

export const crearToken = usuario => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    const exp = Math.floor(Date.now() / 1000) + config.TOKEN_EXPIRA_EN_MIN * 60
    const payload = Buffer.from(JSON.stringify({ ...usuario, exp })).toString('base64')
    const firma = buildSignature(header, payload)
    return `${header}.${payload}.${firma}`
}

export const validarToken = token => {
    if (!token) {
        const error = new Error('Token faltante')
        error.status = 401
        throw error
    }

    const partes = token.split('.')
    if (partes.length !== 3) {
        const error = new Error('Token inválido')
        error.status = 401
        throw error
    }

    const [headerB64, payloadB64, firma] = partes
    const firmaEsperada = buildSignature(headerB64, payloadB64)
    if (firma !== firmaEsperada) {
        const error = new Error('Token inválido')
        error.status = 401
        throw error
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
    if (payload.exp * 1000 <= Date.now()) {
        const error = new Error('Token expirado')
        error.status = 401
        throw error
    }

    return payload
}
