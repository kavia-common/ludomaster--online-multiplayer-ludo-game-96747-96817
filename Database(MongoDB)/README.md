# LudoMaster MongoDB Schema and Setup (Legacy directory notice)

Important: This directory name contains parentheses and can cause failures in bash/Docker (e.g., syntax error near unexpected token '('). Use the mirrored directory without parentheses instead:
Database_MongoDB/

All content and scripts are maintained in:
../Database_MongoDB/

How to proceed:
- Update all Dockerfiles, docker-compose, CI, and shell commands to reference Database_MongoDB/ instead of Database(MongoDB)/.
- For schema initialization:
  node Database_MongoDB/scripts/initSchema.js
- For Mongoose indexes:
  node Database_MongoDB/scripts/initMongoose.js
- Backend imports:
  const { getDb } = require('../Database_MongoDB/src/db/connection');

If you cannot change a script immediately and must reference this legacy path in bash, escape or quote the directory:
- Escaped: Database\(MongoDB\)
- Quoted: "Database(MongoDB)"

Below is the original schema documentation for convenience. For the authoritative, up-to-date version, see Database_MongoDB/README.md.

--------------------------------------------------------------------------------
[Original documentation retained for reference]

This document describes the MongoDB schema for LudoMaster, including collections, field structures, required indexes, and initialization steps. It also explains how the backend should connect to this database.

Overview of core collections:
- users
- rooms
- games (history)
- chat_messages
- leaderboards (aggregated) and player_stats (per-user rolling stats)
- system_events (optional operational logs)

Notes:
- All IDs are ObjectId unless otherwise specified.
- Timestamps are ISODate, maintained via code or MongoDB defaults.
- No sample data is included.
- Where appropriate, compound indexes are defined to serve query patterns.

Environment variables:
- MONGODB_URI: MongoDB connection string (required)
- MONGODB_DB_NAME: Target database name (required)
- MONGODB_TLS: Optional flag ("true"/"false"), default false
- MONGODB_REPLICA_SET: Optional, if your cluster uses a replica set

You should ask the operator to set these in the .env file of the Backend container.

--------------------------------------------------------------------------------
Collection: users

Purpose:
Holds user accounts, auth identifiers, and public profile.

Fields:
- _id: ObjectId
- email: string (unique, lowercased), nullable if using phone only
- phone: string (E.164) (unique), nullable if using email only
- emailVerified: boolean (default: false)
- phoneVerified: boolean (default: false)
- passwordHash: string (bcrypt/argon2 hash)
- displayName: string
- avatarUrl: string (nullable)
- createdAt: ISODate
- updatedAt: ISODate
- lastLoginAt: ISODate (nullable)
- status: string enum ["active","banned","inactive"] (default "active")
- roles: array<string> (e.g., ["user"], ["admin"])
- preferences: object {
    soundEnabled: boolean,
    colorBlindMode: boolean,
    locale: string
  }
- statsSnapshot: object {
    gamesPlayed: number,
    gamesWon: number,
    totalTimePlayedSec: number,
    lastGameAt: ISODate
  }

Indexes:
- Unique: { email: 1 } partial (only when email exists)
- Unique: { phone: 1 } partial (only when phone exists)
- { status: 1 }
- { createdAt: -1 }
- { displayName: "text" } or create case-insensitive index via collation if search is needed

--------------------------------------------------------------------------------
Collection: rooms

Purpose:
Tracks open/active game rooms (public/private), membership, and settings.

Fields:
- _id: ObjectId
- code: string (short invite code, unique for private rooms)
- name: string
- isPrivate: boolean (default: false)
- ownerId: ObjectId (ref users._id)
- maxPlayers: number (2–4)
- players: array of {
    userId: ObjectId,
    joinedAt: ISODate,
    team: string|null,
    color: string|null, // e.g., "red","green","blue","yellow"
    isReady: boolean
  }
- status: string enum ["waiting","in_progress","completed","closed"] (default "waiting")
- createdAt: ISODate
- updatedAt: ISODate
- gameSettings: object {
    allowSpectators: boolean,
    turnTimerSec: number|null,
    diceFairness: string enum ["secure_random","server_seed"],
    aiFill: boolean // allow AI to fill empty seats
  }
- currentGameId: ObjectId|null (ref games._id while in progress)

Indexes:
- Unique: { code: 1 } partial (only when code exists)
- { isPrivate: 1, status: 1, createdAt: -1 }
- { ownerId: 1, createdAt: -1 }
- { status: 1, updatedAt: -1 }

--------------------------------------------------------------------------------
Collection: games

Purpose:
Stores immutable game history and summary. During an active game, a document may be created and updated; when completed, it becomes read-only.

Fields:
- _id: ObjectId
- roomId: ObjectId (ref rooms._id)
- players: array of {
    userId: ObjectId,
    displayName: string,
    color: string,
    seat: number // 0..3
  }
- winner: ObjectId|null (ref users._id)
- status: string enum ["in_progress","completed","abandoned"] (default "in_progress")
- startedAt: ISODate
- endedAt: ISODate|null
- durationSec: number|null
- finalPlacements: array of {
    userId: ObjectId,
    place: number // 1..4
  }
- moves: array of {
    t: ISODate,          // timestamp
    by: ObjectId,        // userId who performed the action
    dice: number|null,   // dice roll if applicable
    tokenId: string,null,// which token was moved
    from: string,null,   // board pos before
    to: string,null,     // board pos after
    type: string         // "roll"|"move"|"capture"|"enter"|"finish"|"system"
  }
- integrity: object {
    seed: string|null,   // server seed if using "server_seed" mode
    hash: string|null,   // commitment hash for fairness proofs
  }

Indexes:
- { roomId: 1, startedAt: -1 }
- { status: 1, startedAt: -1 }
- { "players.userId": 1, startedAt: -1 }
- { winner: 1, endedAt: -1 }

--------------------------------------------------------------------------------
Collection: chat_messages

Purpose:
Stores real-time chat per room and system notifications.

Fields:
- _id: ObjectId
- roomId: ObjectId (ref rooms._id)
- fromUserId: ObjectId (ref users._id) or null for system
- type: string enum ["user","system","moderation"]
- content: string
- createdAt: ISODate
- flags: object {
    moderated: boolean,
    removed: boolean,
    reason: string|null
  }

Indexes:
- { roomId: 1, createdAt: 1 }
- { fromUserId: 1, createdAt: -1 }

--------------------------------------------------------------------------------
Collection: player_stats

Purpose:
Rolling per-user statistics aggregated periodically and updated after each match.

Fields:
- _id: ObjectId
- userId: ObjectId (ref users._id)
- gamesPlayed: number
- gamesWon: number
- winRate: number // precomputed to speed leaderboard
- avgTurnsPerGame: number|null
- totalCaptures: number
- longestWinStreak: number
- currentWinStreak: number
- lastUpdatedAt: ISODate

Indexes:
- Unique: { userId: 1 }
- { winRate: -1 }
- { gamesWon: -1 }
- { lastUpdatedAt: -1 }

--------------------------------------------------------------------------------
Collection: leaderboards

Purpose:
Materialized leaderboard snapshots, e.g., daily/weekly/global. This supports queries without heavy aggregation at runtime.

Fields:
- _id: ObjectId
- type: string enum ["global","weekly","daily"]
- period: string|null // e.g., "2025-W35" or "2025-08-25" for daily; null for global
- generatedAt: ISODate
- entries: array of {
    rank: number,
    userId: ObjectId,
    displayName: string,
    gamesWon: number,
    gamesPlayed: number,
    winRate: number
  }

Indexes:
- { type: 1, period: 1 } // used to fetch latest snapshot
- { generatedAt: -1 }

--------------------------------------------------------------------------------
Collection: system_events (optional)

Purpose:
Operational logs for admin/audits.

Fields:
- _id: ObjectId
- type: string
- payload: object
- createdAt: ISODate
- severity: string enum ["info","warn","error"]

Indexes:
- { type: 1, createdAt: -1 }
- { severity: 1, createdAt: -1 }

--------------------------------------------------------------------------------
Initialization Script

Use the provided init script to create collections and indexes without inserting data. Run this once after deploying MongoDB or during CI/CD database setup.

File: scripts/initSchema.js
- Reads environment variables (MONGODB_URI, MONGODB_DB_NAME).
- Creates collections if not present.
- Creates indexes as specified.
- No sample data.

Usage:
1) Ensure the following environment variables are set in your backend or in your current shell:
   - MONGODB_URI
   - MONGODB_DB_NAME

2) Run:
   node Database_MongoDB/scripts/initSchema.js

3) Verify indexes:
   In Mongo Shell or Compass, inspect each collection's indexes.

--------------------------------------------------------------------------------
Backend Integration

The backend should import the Database_MongoDB/src/db/connection.js module to get a connected MongoClient and db instance. Models in Database_MongoDB/src/models/* provide typed accessors and common operations.

Environment variables required (set in Backend container .env):
- MONGODB_URI
- MONGODB_DB_NAME
- (optional) MONGODB_TLS, MONGODB_REPLICA_SET

Connection snippet (from this repo):
const { getDb } = require('../Database_MongoDB/src/db/connection');

Example in backend (Express) usage:
const { getDb } = require('../Database_MongoDB/src/db/connection');
const db = await getDb();
const users = db.collection('users');
const user = await users.findOne({ email: 'test@example.com' });

Alternatively, if the backend uses its own structure, copy over connection.js and adjust relative paths or publish this package as an internal module.

--------------------------------------------------------------------------------
Data Lifecycle Guidelines

- Users: updates frequent; use updatedAt on modifications.
- Rooms: ephemeral but with frequent updates; prefer targeted updates to avoid document growth beyond BSON limits.
- Games: append-only moves during active play; upon completion, freeze document.
- Chat: high write rate; consider TTL on older messages if storage limits require it.
- Stats: update on game completion; keep player_stats small, aggregate to leaderboards periodically (cron/worker).
- Leaderboards: generate scheduled snapshots; keep only last N snapshots per type/period if necessary.
- Use transactions for multi-document consistency if your cluster supports it.

--------------------------------------------------------------------------------
Security and Compliance

- Never store plaintext passwords. Use strong hash (argon2/bcrypt).
- Avoid sensitive PII in chat logs.
- Enforce authorization checks in backend; DB enforces structure/index but not permissions.
- Enable TLS for production MongoDB connections (MONGODB_TLS=true).
- Use role-based access control at the DB level when applicable.

--------------------------------------------------------------------------------
Maintenance

- Monitor index sizes and performance.
- Rebuild leaderboard snapshots if logic changes.
- Keep an eye on document sizes in rooms/games; split or archive if approaching 16MB.

--------------------------------------------------------------------------------
Changelog
v1.0.0: Initial schema and setup scripts.

Note: This file remains in the legacy directory only as a compatibility pointer; please use Database_MongoDB/ going forward.
