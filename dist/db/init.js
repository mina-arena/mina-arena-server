import { Player } from '../models/index.js';
// For information on options for the `sync` method, see:
// https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization
const syncOptions = {};
const dbInit = () => {
    Player.sync(syncOptions);
};
export default dbInit;
//# sourceMappingURL=init.js.map