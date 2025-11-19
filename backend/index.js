import Server from './server.js'
import config from './config.js'
import CnxSQLite from './modelo/DBSQLite.js'

try {
    if (config.MODO_PERSISTENCIA == 'SQLITE') {
        await CnxSQLite.conectar()
        console.log('Conexión a SQLite establecida')
    }

    const server = new Server(config.PORT)
    server.start()
}
catch (error) {
    console.log(`Error en conexión de base de datos: ${error.message}`)
}
