import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../db/connection";

// Define attributes for Chat
interface ChatAttributes {
  id: number;
  playerId: number;    // Refers to the player (User)
  userId: number;      // Refers to the user initiating the chat
  message: string;
  created_at?: Date;
  updated_at?: Date;
}

// Optional attributes for creating a Chat record (id will be auto-incremented)
interface ChatCreationAttributes extends Optional<ChatAttributes, "id"> {}

// Define the Chat model class
class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: number;
  public playerId!: number;
  public userId!: number;
  public message!: string;

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
      allowNull: false,
      references: { model: "players", key: "id" }, // Foreign key reference to the User model (Player)
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" }, // Foreign key reference to the User model (Initiating User)
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
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
