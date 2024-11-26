import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../db/connection";

class SystemTotalAmount extends Model {
  public totalAmount!: number;
  public transactionFee!: number;

  // timestamps!
  public readonly created_at!: Date;
  public readonly last_updated!: Date;
}

SystemTotalAmount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    totalAmount: {
      type: DataTypes.FLOAT,  
      allowNull: false,
      defaultValue: 0,
    },
    transactionFee: {
      type: DataTypes.FLOAT,  
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "system_total_amounts",
    createdAt: "created_at",
    updatedAt: "last_updated",
  }
);

export default SystemTotalAmount;
