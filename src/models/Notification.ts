import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../db/connection";
import User from "./User"; // Assuming notifications are associated with users

interface NotificationAttributes {
  id: number;
  title: string;
  message: string;
  status: number;
  userId: number;
  path:string;
  created_at?: Date;
  last_updated?: Date;
}

// Optional attributes for creation (e.g., id and timestamps auto-generated)
interface NotificationCreationAttributes extends Optional<NotificationAttributes, "id"> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public title!: string;
  public message!: string;
  public path!: string;
  public status!: number;
  public userId!: number;

  // timestamps!
  public readonly created_at!: Date;
  public readonly last_updated!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, 
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "notifications",
    createdAt: "created_at",
    updatedAt: "last_updated",
  }
);

export default Notification;
