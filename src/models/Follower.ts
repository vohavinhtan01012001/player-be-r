import { DataTypes, Model, Sequelize } from "sequelize";
import sequelizeConnection from "../db/connection";
import User from "./User";
import Player from "./Player";

class Follower extends Model {
  public id!: number;
  public User!: User;
  public Player!: Player;
  public playerId!: number;
  // timestamps!
  public readonly created_at!: Date;
  public readonly last_updated!: Date;
}

Follower.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Change to allowNull: true for the optional association
      references: {
        model: User, // Reference the Category model
        key: "id", // Reference the id column in the Category model
      },
      onUpdate: "CASCADE", // Define the behavior on update
      onDelete: "SET NULL", // Define the behavior on delete
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Change to allowNull: true for the optional association
      references: {
        model: Player, // Reference the Category model
        key: "id", // Reference the id column in the Category model
      },
      onUpdate: "CASCADE", // Define the behavior on update
      onDelete: "SET NULL", // Define the behavior on delete
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: "followers",
    tableName: "followers",
    createdAt: "created_at",
    updatedAt: "last_updated",
  }
);

export default Follower;
