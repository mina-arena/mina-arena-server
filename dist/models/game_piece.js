import { DataTypes, Model, } from 'sequelize';
import sequelizeConnection from '../db/config.js';
import * as Models from './index.js';
import { Position, Piece, } from 'mina-arena-contracts';
import { PublicKey, Field } from 'snarkyjs';
export function distanceBetweenPoints(point1, point2) {
    let dx = point2.x - point1.x;
    let dy = point2.y - point1.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}
const INVALID_MOVE_REASONS = ['beyondMaxRange', 'collidesWithOtherPiece'];
class GamePiece extends Model {
    async game() {
        return await Models.Game.findByPk(this.gameId);
    }
    async gamePlayer() {
        return await Models.GamePlayer.findByPk(this.gamePlayerId);
    }
    async playerUnit() {
        return await Models.PlayerUnit.findByPk(this.playerUnitId);
    }
    async unit() {
        return await (await this.playerUnit()).unit();
    }
    async toSnarkyPiece() {
        const playerUnit = await this.playerUnit();
        const unit = await playerUnit.unit();
        const gamePlayer = await this.gamePlayer();
        const player = await gamePlayer.player();
        const snarkyUnit = unit.toSnarkyUnit();
        // TODO: temporary hack to get the correct public key into the proof
        const minaPublicKey = PublicKey.fromBase58(player.minaPublicKey);
        const snarkyPosition = Position.fromXY(this.positionX, this.positionY);
        const gamePieceNumber = await this.gamePieceNumber();
        return new Piece(Field(gamePieceNumber), minaPublicKey, snarkyPosition, snarkyUnit);
    }
    // Returns the number of this game piece in the game, starting from 1
    async gamePieceNumber() {
        const gamePieces = await Models.GamePiece.findAll({
            where: {
                gameId: this.gameId,
            },
            order: [
                ['playerUnitId', 'ASC'], // hopefully this never changes?
            ],
        });
        return gamePieces.findIndex((gamePiece) => gamePiece.id == this.id) + 1;
    }
    coordinates() {
        if (this.positionX == undefined && this.positionY == undefined)
            return null;
        return { x: this.positionX, y: this.positionY };
    }
    isAlive() {
        return this.health > 0;
    }
    isDead() {
        return this.health <= 0;
    }
    distanceTo(targetCoordinates) {
        return distanceBetweenPoints(this.coordinates(), targetCoordinates);
    }
    async checkMoveValidity(moveTo) {
        const moveFrom = this.coordinates();
        const distance = this.distanceTo(moveTo);
        const unit = await this.unit();
        const movementSpeed = unit.movementSpeed;
        const resultData = { moveFrom, moveTo, distance, movementSpeed };
        if (distance > unit.movementSpeed) {
            return {
                ...resultData,
                valid: false,
                invalidReason: 'beyondMaxRange',
            };
        }
        // TODO: For now we are just looking for units which are literally
        // on this exact spot. We probably want to enforce more space
        // around a unit, giving them some radius.
        const collidingUnits = await Models.GamePiece.findAll({
            where: { gameId: this.gameId, positionX: moveTo.x, positionY: moveTo.y },
        });
        if (collidingUnits.length > 0) {
            return {
                ...resultData,
                valid: false,
                invalidReason: 'collidesWithOtherPiece',
            };
        }
        return { ...resultData, valid: true };
    }
}
GamePiece.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    gameId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    gamePlayerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    playerUnitId: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    positionX: {
        type: DataTypes.INTEGER,
    },
    positionY: {
        type: DataTypes.INTEGER,
    },
    health: {
        allowNull: false,
        type: DataTypes.INTEGER,
    },
    createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
    updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
    },
}, {
    sequelize: sequelizeConnection,
});
export default GamePiece;
//# sourceMappingURL=game_piece.js.map