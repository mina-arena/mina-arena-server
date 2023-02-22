import { DataTypes, Model, Optional } from 'sequelize'
import sequelizeConnection from '../db/config.js'

interface PlayerAttributes {
  id: number;
  name: string;
  minaPublicKey: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Indicate that 'id' is optional when creating an instance of this model
export interface PlayerInput extends Optional<PlayerAttributes, 'id'> {}
export interface PlayerOutput extends Required<PlayerAttributes> {}

class Player extends Model<PlayerAttributes, PlayerInput> implements PlayerAttributes {
  declare id: number
  declare name: string
  declare minaPublicKey: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

Player.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minaPublicKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  timestamps: true,
  sequelize: sequelizeConnection,
  paranoid: true
})

export default Player;