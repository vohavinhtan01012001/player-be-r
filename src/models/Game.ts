import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../db/connection";

class Game extends Model {
  public id!: number;
  public title!: string;
  public image!: string;

  // timestamps!
  public readonly created_at!: Date;
  public readonly last_updated!: Date;
}

Game.init(
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
    image: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "games",
    createdAt: "created_at",
    updatedAt: "last_updated",
  }
);

export default Game;
