import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../db/connection";

// Define attributes for Chat
interface ChatAttributes {
  id: number;
  playerId?: number;    // Refers to the player (optional if senderType is 'user')
  userId?: number;      // Refers to the user (optional if senderType is 'player')
  senderType: "user" | "player"; // Field to determine the sender type
  message: string;
  donate: number;    
  created_at?: Date;
  updated_at?: Date;
}

// Optional attributes for creating a Chat record (id will be auto-incremented)
interface ChatCreationAttributes extends Optional<ChatAttributes, "id" | "donate"> {}

// Define the Chat model class
class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: number;
  public playerId?: number;
  public userId?: number;
  public senderType!: "user" | "player";  // Add the senderType field
  public message!: string;
  public donate!: number; // New donate field

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the Chat model
Chat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null since either playerId or userId will be used
      references: { model: "players", key: "id" }, // Foreign key reference to the Player model
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null since either playerId or userId will be used
      references: { model: "users", key: "id" }, // Foreign key reference to the User model
    },
    senderType: {
      type: DataTypes.ENUM("user", "player"), // Define the sender type
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    donate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
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
    tableName: "chats",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Chat;
