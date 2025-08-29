/**
 * Users model accessor and basic helpers.
 */
// PUBLIC_INTERFACE
async function usersCollection() {
  /** Returns the users collection. */
  const { getDb } = require('../db/connection');
  const db = await getDb();
  return db.collection('users');
}

// PUBLIC_INTERFACE
async function findUserByEmail(email) {
  /** Find a user by email (lowercased). */
  const col = await usersCollection();
  if (!email) return null;
  return col.findOne({ email: String(email).toLowerCase() });
}

// PUBLIC_INTERFACE
async function findUserByPhone(phone) {
  /** Find a user by phone (E.164). */
  const col = await usersCollection();
  if (!phone) return null;
  return col.findOne({ phone: String(phone) });
}

module.exports = {
  usersCollection,
  findUserByEmail,
  findUserByPhone,
};
