'use strict';
/**
 * Mongoose connection helper for LudoMaster.
 * Reads environment variables:
 *  - MONGODB_URI (required)
 *  - MONGODB_DB_NAME (required)
 *  - MONGODB_TLS (optional, "true"/"false")
 *  - MONGODB_REPLICA_SET (optional)
 *
 * This module maintains a single shared Mongoose connection.
 */
// PUBLIC_INTERFACE
async function getMongoose() {
  /** Returns a connected Mongoose instance configured with environment variables. */
  const mongoose = require('mongoose');

  function requireEnv(name) {
    const v = process.env[name];
    if (!v) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return v;
  }

  if (!global.__ludomaster_mongoose) {
    global.__ludomaster_mongoose = { connecting: null, instance: mongoose };
  }

  const m = global.__ludomaster_mongoose.instance;
  if (m.connection && m.connection.readyState === 1) {
    return m;
  }

  if (!global.__ludomaster_mongoose.connecting) {
    const uri = requireEnv('MONGODB_URI');
    const dbName = requireEnv('MONGODB_DB_NAME');

    /** Compose options without hardcoding TLS or RS unless provided. */
    const options = {
      dbName,
      maxPoolSize: 10,
      autoIndex: false, // rely on explicit index builds via code
    };
    if (process.env.MONGODB_TLS === 'true') options.tls = true;
    if (process.env.MONGODB_REPLICA_SET) options.replicaSet = process.env.MONGODB_REPLICA_SET;

    global.__ludomaster_mongoose.connecting = m.connect(uri, options).then(() => m);
  }

  return global.__ludomaster_mongoose.connecting;
}

module.exports = { getMongoose };
