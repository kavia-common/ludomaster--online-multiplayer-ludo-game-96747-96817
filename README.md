# LudoMaster Database (MongoDB)

This workspace contains the MongoDB schema and initialization assets for LudoMaster.

Quick start:
- Configure environment variables (see Database_MongoDB/.env.example if available or set MONGODB_* in your environment).
- Option A (native driver): create collections and indexes
  node Database_MongoDB/scripts/initSchema.js
- Option B (Mongoose): ensure model indexes
  node Database_MongoDB/scripts/initMongoose.js

Backend usage:
- Native driver helper:
  const { getDb } = require('./Database_MongoDB/src/db/connection');
- Mongoose helper and models:
  const { initMongooseModels } = require('./Database_MongoDB/src/models/mongoose');
  const { User, Room, Game, ChatMessage, PlayerStats, Leaderboard } = await initMongooseModels();

See detailed schema and index descriptions in:
Database_MongoDB/README.md