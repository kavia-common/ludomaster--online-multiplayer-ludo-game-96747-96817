/**
 * Rooms model accessor and basic helpers.
 */
// PUBLIC_INTERFACE
async function roomsCollection() {
  /** Returns the rooms collection. */
  const { getDb } = require('../db/connection');
  const db = await getDb();
  return db.collection('rooms');
}

// PUBLIC_INTERFACE
async function findPublicWaitingRooms(limit = 20) {
  /** Returns list of public rooms waiting for players. */
  const col = await roomsCollection();
  return col
    .find({ isPrivate: false, status: 'waiting' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

module.exports = {
  roomsCollection,
  findPublicWaitingRooms,
};
