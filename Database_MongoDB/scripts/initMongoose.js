#!/usr/bin/env node
/**
 * Initialize Mongoose models and ensure indexes.
 * Requires env: MONGODB_URI, MONGODB_DB_NAME
 * Optional: MONGODB_TLS, MONGODB_REPLICA_SET
 *
 * Note: This complements scripts/initSchema.js (native driver).
 */
(async () => {
  try {
    const { initMongooseModels } = require('../src/models/mongoose');
    const { mongoose, User, Room, Game, ChatMessage, PlayerStats, Leaderboard, SystemEvent } =
      await initMongooseModels();

    await Promise.all([
      User.init(),
      Room.init(),
      Game.init(),
      ChatMessage.init(),
      PlayerStats.init(),
      Leaderboard.init(),
      SystemEvent.init(),
    ]);

    // eslint-disable-next-line no-console
    console.log('Mongoose models initialized and indexes ensured.');
    await mongoose.connection.close();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Mongoose initialization failed:', err);
    process.exit(1);
  }
})();
