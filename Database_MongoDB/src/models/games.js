/**
 * Games model accessor and basic helpers.
 */
// PUBLIC_INTERFACE
async function gamesCollection() {
  /** Returns the games collection. */
  const { getDb } = require('../db/connection');
  const db = await getDb();
  return db.collection('games');
}

// PUBLIC_INTERFACE
async function findRecentGamesForUser(userId, limit = 20) {
  /** Returns recent games for a user by userId (ObjectId). */
  const { ObjectId } = require('mongodb');
  const col = await gamesCollection();
  const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;
  return col
    .find({ 'players.userId': _id })
    .sort({ startedAt: -1 })
    .limit(limit)
    .toArray();
}

module.exports = {
  gamesCollection,
  findRecentGamesForUser,
};
