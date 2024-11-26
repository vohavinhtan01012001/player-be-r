import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../db/connection";
import User from "./User"; // Assuming User model exists

class TransactionHistory extends Model {
  public id!: number;
  public amount!: number;           // Số tiền thay đổi
  public type!: "credit" | "debit"; // Loại giao dịch: 'credit' (cộng) hoặc 'debit' (trừ)
  public description!: string;      // Mô tả chi tiết giao dịch
  public userId!: number;          // ID người dùng liên quan đến giao dịch

  // timestamps!
  public readonly created_at!: Date;
  public readonly last_updated!: Date;
}

TransactionHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("player", "user"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    sequelize: sequelizeConnection,
    tableName: "transaction_history",
    createdAt: "created_at",
    updatedAt: "last_updated",
  }
);

TransactionHistory.belongsTo(User, { foreignKey: "userId" });

export default TransactionHistory;


// CREATE TABLE transaction_history (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   amount FLOAT NOT NULL,
//   type ENUM('credit', 'debit') NOT NULL,
//   description VARCHAR(255) NOT NULL,
//   userId INT NOT NULL,
//   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
// );
