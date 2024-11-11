import { DataTypes, Model, Optional } from "sequelize";
import sequelizeConnection from "../db/connection";

// Define attributes for Banner
interface BannerAttributes {
  id: number;
  title: string;
  description: string;
  image: string; // URL or file path for the banner image
  status: boolean; // Active or inactive status of the banner
  created_at?: Date;
  updated_at?: Date;
}

// Optional attributes for creating a Banner record (id will be auto-incremented)
interface BannerCreationAttributes extends Optional<BannerAttributes, "id"> {}

// Define the Banner model class
class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public image!: string;
  public status!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Initialize the Banner model
Banner.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true, // Optional field
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false, // Ensure the image URL or path is required
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:1
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
    tableName: "banners",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Banner;
