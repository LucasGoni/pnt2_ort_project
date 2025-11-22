import { DataTypes, Model } from 'sequelize'
import CnxSQLite from './DBSQLite.js'

class Rutina extends Model {}

class RutinasModel {
    static model = null

    static init = () => {
        if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
            throw new Error('La conexión a SQLite no está inicializada')
        }

        if (!RutinasModel.model) {
            RutinasModel.model = Rutina.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                titulo: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                nivel: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                duracionMin: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                objetivo: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                estado: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'activa'
                },
                entrenadorId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                ejercicios: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: '[]'
                }
            }, {
                sequelize: CnxSQLite.sequelize,
                modelName: 'Rutina',
                tableName: 'rutinas',
                timestamps: true
            })
        }

        return RutinasModel.model
    }

    static sync = async () => {
        const model = RutinasModel.init()
        await model.sync()
        return model
    }
}

export default RutinasModel
