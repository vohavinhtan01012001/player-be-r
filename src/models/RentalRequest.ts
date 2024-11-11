import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../db/connection";
import User from "./User";  // Assuming User model exists
import Player from "./Player";  // Assuming Player model exists

class RentalRequest extends Model {
  public id!: number;
  public userId!: number;
  public playerId!: number;
  public status!: number;
  public hours!: number;        // Rental duration
  public totalPrice!: number;   // Total price
  public rating!: boolean;      // Boolean type for rating

  // timestamps!
  public readonly created_at!: Date;
  public readonly last_updated!: Date;
}

RentalRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Player,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,  // 0 for pending, 1 for approved, etc.
    },
    hours: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,  // Default rental duration is 1 hour
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,  // Default total price set to 0
    },
    rating: {
      type: DataTypes.BOOLEAN,  // Boolean type for rating
      allowNull: false,
      defaultValue: false,      // Default is false
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "rental_requests",
    createdAt: "created_at",
    updatedAt: "last_updated",
  }
);

// Define associations
RentalRequest.belongsTo(User, { foreignKey: "userId" });
RentalRequest.belongsTo(Player, { foreignKey: "playerId" });

export default RentalRequest;
