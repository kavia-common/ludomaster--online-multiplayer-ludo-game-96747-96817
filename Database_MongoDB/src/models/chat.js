/**
 * Chat messages model accessor and basic helpers.
 */
// PUBLIC_INTERFACE
async function chatCollection() {
  /** Returns the chat_messages collection. */
  const { getDb } = require('../db/connection');
  const db = await getDb();
  return db.collection('chat_messages');
}

// PUBLIC_INTERFACE
async function findRoomChat(roomId, limit = 100) {
  /** Returns the most recent chat messages for a room (ascending by time). */
  const { ObjectId } = require('mongodb');
  const col = await chatCollection();
  const _roomId = typeof roomId === 'string' ? new ObjectId(roomId) : roomId;
  const docs = await col
    .find({ roomId: _roomId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.reverse();
}

module.exports = {
  chatCollection,
  findRoomChat,
};
