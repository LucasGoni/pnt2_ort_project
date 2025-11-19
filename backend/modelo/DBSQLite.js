import { Sequelize } from 'sequelize'
import { mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'

import config from '../config.js'

class CnxSQLite {
    static connectionOK = false
    static sequelize = null

    static conectar = async () => {
        const dbPath = config.DB_PATH
        const dbDir = dirname(dbPath)

        if (!existsSync(dbDir)) {
            mkdirSync(dbDir, { recursive: true })
        }

        CnxSQLite.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false
        })

        await CnxSQLite.sequelize.authenticate()
        CnxSQLite.connectionOK = true
    }

    static cerrar = async () => {
        if (CnxSQLite.sequelize) {
            await CnxSQLite.sequelize.close()
            CnxSQLite.connectionOK = false
        }
    }
}

export default CnxSQLite
