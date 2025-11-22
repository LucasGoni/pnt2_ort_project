import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT
const MODO_PERSISTENCIA = process.env.MODO_PERSISTENCIA
const DB_PATH = process.env.DB_PATH
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

export default {
    PORT,
    MODO_PERSISTENCIA,
    DB_PATH,
    JWT_SECRET,
    JWT_EXPIRES_IN
}
