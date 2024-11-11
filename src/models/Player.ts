import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../db/connection";
import Game from "./Game";
import User from "./User"; // Import User model
import { compareSync } from "bcrypt";
import Follower from "./Follower";

interface PlayerAttributes {
    id: number;
    name: string;
    description?: string;
    email: string;
    images?: string[];
    avatar?: string;
    status: number;
    followers?: number;
    price?: number;
    userId: number;  // Add userId for relation
    created_at?: Date;
    phone: string;
    address: string;
}

interface PlayerCreationAttributes extends Optional<PlayerAttributes, "id"> {}

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
    public id!: number;
    public name!: string;
    public description?: string;
    public email!: string;
    public images?: string[];
    public avatar?: string;
    public status!: number;
    public followers?: number;
    public price?: number;
    public userId!: number;  // Add userId
    public phone!: string;
    public address!: string;
    public Users!: User;
    // Timestamps
    public readonly created_at!: Date;

    // Define associations inside the Player model
    public static associate() {
        // Many-to-Many: Player <--> Game
        Player.belongsToMany(Game, { through: "PlayerGames", foreignKey: "playerId" });
        Game.belongsToMany(Player, { through: "PlayerGames", foreignKey: "gameId" });

        // One-to-Many: User <--> Player
        Player.belongsTo(User, { foreignKey: "userId", as: "user" }); // Define association with User
        User.hasMany(Player, { foreignKey: "userId", as: "players" });
    }

    // Include methods for managing Game associations
    public addGames!: (game: Game | Game[], options?: any) => Promise<void>;
    public removeGames!: (game: Game | Game[], options?: any) => Promise<void>;
    public setGames!: (games: Game | Game[], options?: any) => Promise<void>;
    static validPassword: (password: string, hash: string) => boolean;
}

Player.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1, // 1: hoạt động, 2: không hoạt động, 3: Đang bận, 4:chờ duyệt, 5: không duyệt
        },
        followers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        userId: {  // Add userId field
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User, // Reference to the User model
                key: "id",
            },
            onDelete: "CASCADE",
        },
        phone: {
            type: DataTypes.STRING,  // New phone field
            allowNull: false,
            unique: true,  // Ensure phone number is unique
        },
        address: {
            type: DataTypes.STRING,  // New address field
            allowNull: false,
        },
    },
    {
        sequelize: sequelizeConnection,
        tableName: "players",
        createdAt: "created_at",
    }
);

Player.validPassword = (password: string, hash: string) => {
    return compareSync(password, hash);
};
Follower.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
Follower.belongsTo(Player, {
  foreignKey: "playerId",
  targetKey: "id",
});


Player.associate();

export default Player;
