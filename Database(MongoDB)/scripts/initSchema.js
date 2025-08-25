#!/usr/bin/env node
/* LudoMaster MongoDB schema initializer
   Creates collections and indexes without inserting data.
   Requires env vars: MONGODB_URI, MONGODB_DB_NAME
*/
const { MongoClient } = require('mongodb');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

async function ensureCollection(db, name, options = {}) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await db.createCollection(name, options);
    // eslint-disable-next-line no-console
    console.log(`Created collection: ${name}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Collection exists: ${name}`);
  }
  return db.collection(name);
}

async function main() {
  const uri = requireEnv('MONGODB_URI');
  const dbName = requireEnv('MONGODB_DB_NAME');

  const clientOptions = {};
  if (process.env.MONGODB_TLS === 'true') clientOptions.tls = true;
  if (process.env.MONGODB_REPLICA_SET) clientOptions.replicaSet = process.env.MONGODB_REPLICA_SET;

  const client = new MongoClient(uri, clientOptions);
  await client.connect();
  const db = client.db(dbName);
  // eslint-disable-next-line no-console
  console.log(`Connected to MongoDB. DB: ${dbName}`);

  try {
    // users
    const users = await ensureCollection(db, 'users');
    await users.createIndexes([
      // Unique email if exists
      {
        key: { email: 1 },
        name: 'uniq_email',
        unique: true,
        partialFilterExpression: { email: { $exists: true, $type: 'string' } },
      },
      // Unique phone if exists
      {
        key: { phone: 1 },
        name: 'uniq_phone',
        unique: true,
        partialFilterExpression: { phone: { $exists: true, $type: 'string' } },
      },
      { key: { status: 1 }, name: 'status_1' },
      { key: { createdAt: -1 }, name: 'createdAt_-1' },
    ]);

    // rooms
    const rooms = await ensureCollection(db, 'rooms');
    await rooms.createIndexes([
      {
        key: { code: 1 },
        name: 'uniq_code',
        unique: true,
        partialFilterExpression: { code: { $exists: true, $type: 'string' } },
      },
      { key: { isPrivate: 1, status: 1, createdAt: -1 }, name: 'isPrivate_status_createdAt' },
      { key: { ownerId: 1, createdAt: -1 }, name: 'ownerId_createdAt' },
      { key: { status: 1, updatedAt: -1 }, name: 'status_updatedAt' },
    ]);

    // games (history)
    const games = await ensureCollection(db, 'games');
    await games.createIndexes([
      { key: { roomId: 1, startedAt: -1 }, name: 'roomId_startedAt' },
      { key: { status: 1, startedAt: -1 }, name: 'status_startedAt' },
      { key: { 'players.userId': 1, startedAt: -1 }, name: 'playersUserId_startedAt' },
      { key: { winner: 1, endedAt: -1 }, name: 'winner_endedAt' },
    ]);

    // chat_messages
    const chat = await ensureCollection(db, 'chat_messages');
    await chat.createIndexes([
      { key: { roomId: 1, createdAt: 1 }, name: 'roomId_createdAt' },
      { key: { fromUserId: 1, createdAt: -1 }, name: 'fromUserId_createdAt' },
    ]);

    // player_stats
    const playerStats = await ensureCollection(db, 'player_stats');
    await playerStats.createIndexes([
      { key: { userId: 1 }, name: 'uniq_userId', unique: true },
      { key: { winRate: -1 }, name: 'winRate_-1' },
      { key: { gamesWon: -1 }, name: 'gamesWon_-1' },
      { key: { lastUpdatedAt: -1 }, name: 'lastUpdatedAt_-1' },
    ]);

    // leaderboards
    const leaderboards = await ensureCollection(db, 'leaderboards');
    await leaderboards.createIndexes([
      { key: { type: 1, period: 1 }, name: 'type_period' },
      { key: { generatedAt: -1 }, name: 'generatedAt_-1' },
    ]);

    // optional: system_events
    const systemEvents = await ensureCollection(db, 'system_events');
    await systemEvents.createIndexes([
      { key: { type: 1, createdAt: -1 }, name: 'type_createdAt' },
      { key: { severity: 1, createdAt: -1 }, name: 'severity_createdAt' },
    ]);

    // eslint-disable-next-line no-console
    console.log('Schema initialization complete.');
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Initialization failed:', err);
  process.exit(1);
});
