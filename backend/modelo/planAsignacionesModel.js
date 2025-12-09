import { DataTypes, Model } from "sequelize";
import CnxSQLite from "./DBSQLite.js";

class PlanAsignacion extends Model {}

class PlanAsignacionesModel {
  static model = null;

  static init = () => {
    if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
      throw new Error("La conexión a SQLite no está inicializada");
    }

    if (!PlanAsignacionesModel.model) {
      PlanAsignacionesModel.model = PlanAsignacion.init(
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          alumnoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // Un alumno solo puede tener 1 plan activo a la vez
          },
          planId: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          asignacion: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "[]",
          },
          sesiones: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "[]",
          },
          vigenciaDesde: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          vigenciaHasta: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          entrenadorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          entrenadorNombre: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          asignadoPor: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          meta: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
        },
        {
          sequelize: CnxSQLite.sequelize,
          modelName: "PlanAsignacion",
          tableName: "plan_asignaciones",
          timestamps: true,
        }
      );
    }

    return PlanAsignacionesModel.model;
  };

  static sync = async () => {
    const model = PlanAsignacionesModel.init();
    const qi = CnxSQLite.sequelize.getQueryInterface();
    // Si la tabla ya existiera (upgrade), agregamos columnas faltantes sin recrearla.
    try {
      const desc = await qi.describeTable("plan_asignaciones");
      if (desc && !desc.entrenadorNombre) {
        await qi.addColumn("plan_asignaciones", "entrenadorNombre", {
          type: DataTypes.STRING,
          allowNull: true,
        });
      }
      if (desc && !desc.asignadoPor) {
        await qi.addColumn("plan_asignaciones", "asignadoPor", {
          type: DataTypes.INTEGER,
          allowNull: true,
        });
      }
      if (desc && !desc.meta) {
        await qi.addColumn("plan_asignaciones", "meta", {
          type: DataTypes.TEXT,
          allowNull: true,
        });
      }
    } catch (_e) {
      // si la tabla no existe, sync la crea
    }
    await model.sync();
    return model;
  };
}

export default PlanAsignacionesModel;
