import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../db/connection";
import User from "./User";
import Player from "./Player";

// Define attributes for Comment
interface CommentAttributes {
  id: number;
  playerId?: number;    // Refers to the player (optional)
  userId?: number;      // Refers to the user (optional)
  message: string;
  rating?: number;      // Optional rating field
  created_at?: Date;
  updated_at?: Date;
}

// Optional attributes for creating a Comment record (id will be auto-incremented)
interface CommentCreationAttributes extends Optional<CommentAttributes, "id"> {}

// Define the Comment model class
class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public playerId?: number;
  public userId?: number;
  public message!: string;
  public rating?: number; // Add the rating field
  public Player?: Player; // Add the rating field

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the Comment model
Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null since playerId can be optional
      references: { model: "players", key: "id" }, // Foreign key reference to the Player model
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null since userId can be optional
      references: { model: "users", key: "id" }, // Foreign key reference to the User model
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT, // Change to FLOAT
      allowNull: true, // Allow null since rating is optional
      validate: {
        min: 1.0, // Minimum rating
        max: 5.0  // Maximum rating
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeConnection,
    tableName: "comments",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Player, { foreignKey: "playerId" });

export default Comment;
