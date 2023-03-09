// import { Op } from 'sequelize';
// import { Player } from '../../models/index.js';
// import { GetAllPlayersFilters } from './types.js';
// import { PlayerInput, PlayerOutput } from '../../models/player.js';
// export const create = async (payload: PlayerInput): Promise<PlayerOutput> => {
//   return await Player.create(payload);
// }
// export const update = async (id: number, payload: Partial<PlayerInput>): Promise<PlayerOutput> => {
//   const player = await Player.findByPk(id);
//   if (!player) throw new Error('Not found');
//   return await (player as Player).update(payload);
// }
// export const getById = async (id: number): Promise<PlayerOutput> => {
//   const player = await Player.findByPk(id);
//   if (!player) throw new Error('Not found');
//   return player;
// }
// export const deleteById = async (id: number): Promise<boolean> => {
//   const deletedPlayerCount = await Player.destroy({ where: { id } });
//   return !!deletedPlayerCount;
// }
// export const getAll = async (filters?: GetAllPlayersFilters): Promise<PlayerOutput[]> => {
//   return Player.findAll({
//     where: {
//       ...(filters?.isDeleted && {deletedAt: {[Op.not]: null}})
//     },
//     ...((filters?.isDeleted || filters?.includeDeleted) && {paranoid: true})
//   });
// }
//# sourceMappingURL=player.js.map