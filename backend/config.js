import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 8080
const MODO_PERSISTENCIA = process.env.MODO_PERSISTENCIA || 'SQLITE'
const DB_PATH = process.env.DB_PATH || './data/database.sqlite'

export default {
    PORT,
    MODO_PERSISTENCIA,
    DB_PATH
}
