/**
 * Player stats and leaderboard model accessors.
 */
// PUBLIC_INTERFACE
async function playerStatsCollection() {
  /** Returns the player_stats collection. */
  const { getDb } = require('../db/connection');
  const db = await getDb();
  return db.collection('player_stats');
}

// PUBLIC_INTERFACE
async function leaderboardsCollection() {
  /** Returns the leaderboards collection. */
  const { getDb } = require('../db/connection');
  const db = await getDb();
  return db.collection('leaderboards');
}

module.exports = {
  playerStatsCollection,
  leaderboardsCollection,
};
