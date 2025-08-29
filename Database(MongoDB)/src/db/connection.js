/**
 * MongoDB connection helper for LudoMaster.
 * Reads environment variables:
 *  - MONGODB_URI (required)
 *  - MONGODB_DB_NAME (required)
 *  - MONGODB_TLS (optional, "true"/"false")
 *  - MONGODB_REPLICA_SET (optional)
 *
 * Usage:
 *   const { getDb, getClient } = require('./connection');
 *   const db = await getDb();
 *   const users = db.collection('users');
 *
 * This module maintains a single shared MongoClient instance.
 */
// PUBLIC_INTERFACE
async function getDb() {
  /** Returns the connected Db instance using environment configuration. */
  const { MongoClient } = require('mongodb');

  function requireEnv(name) {
    const v = process.env[name];
    if (!v) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return v;
  }

  // cache connection
  if (!global.__ludomaster_mongo) {
    global.__ludomaster_mongo = { client: null, db: null, connecting: null };
  }

  if (global.__ludomaster_mongo.db) {
    return global.__ludomaster_mongo.db;
  }

  if (!global.__ludomaster_mongo.connecting) {
    const uri = requireEnv('MONGODB_URI');
    const dbName = requireEnv('MONGODB_DB_NAME');
    const clientOptions = {};
    if (process.env.MONGODB_TLS === 'true') clientOptions.tls = true;
    if (process.env.MONGODB_REPLICA_SET) clientOptions.replicaSet = process.env.MONGODB_REPLICA_SET;

    const client = new MongoClient(uri, clientOptions);
    global.__ludomaster_mongo.connecting = client.connect().then(() => {
      global.__ludomaster_mongo.client = client;
      global.__ludomaster_mongo.db = client.db(dbName);
      return global.__ludomaster_mongo.db;
    });
  }

  return global.__ludomaster_mongo.connecting;
}

// PUBLIC_INTERFACE
async function getClient() {
  /** Returns the connected MongoClient instance. */
  await getDb(); // ensure connection
  return global.__ludomaster_mongo.client;
}

module.exports = { getDb, getClient };
