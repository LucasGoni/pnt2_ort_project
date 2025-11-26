import { DataTypes, Model } from 'sequelize'
import CnxSQLite from './DBSQLite.js'

class Progreso extends Model {}

class ProgresosModel {
  static model = null

  static init = () => {
    if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
      throw new Error('La conexión a SQLite no está inicializada')
    }

    if (!ProgresosModel.model) {
      ProgresosModel.model = Progreso.init({
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        alumnoId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        peso: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        repeticiones: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        observaciones: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        fechaRegistro: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      }, {
        sequelize: CnxSQLite.sequelize,
        modelName: 'Progreso',
        tableName: 'progresos',
        timestamps: true
      })
    }

    return ProgresosModel.model
  }

  static sync = async () => {
    const model = ProgresosModel.init()
    await model.sync()
    return model
  }
}

export default ProgresosModel
