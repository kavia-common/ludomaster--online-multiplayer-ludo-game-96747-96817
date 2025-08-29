'use strict';
const { Schema, Types } = require('mongoose');

const PlayerStatsSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, unique: true, index: true },
    gamesPlayed: { type: Number, default: 0, min: 0 },
    gamesWon: { type: Number, default: 0, min: 0, index: -1 },
    winRate: { type: Number, default: 0, min: 0, max: 1, index: -1 },
    avgTurnsPerGame: { type: Number, default: null, min: 0 },
    totalCaptures: { type: Number, default: 0, min: 0 },
    longestWinStreak: { type: Number, default: 0, min: 0 },
    currentWinStreak: { type: Number, default: 0, min: 0 },
    lastUpdatedAt: { type: Date, default: () => new Date(), index: -1 },
  },
  { collection: 'player_stats' }
);

PlayerStatsSchema.index({ userId: 1 }, { unique: true });
PlayerStatsSchema.index({ winRate: -1 });
PlayerStatsSchema.index({ gamesWon: -1 });
PlayerStatsSchema.index({ lastUpdatedAt: -1 });

const LeaderboardEntrySchema = new Schema(
  {
    rank: { type: Number, required: true, min: 1 },
    userId: { type: Types.ObjectId, required: true },
    displayName: { type: String, required: true, trim: true },
    gamesWon: { type: Number, required: true, min: 0 },
    gamesPlayed: { type: Number, required: true, min: 0 },
    winRate: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const LeaderboardSchema = new Schema(
  {
    type: { type: String, enum: ['global', 'weekly', 'daily'], required: true, index: true },
    period: { type: String, default: null, index: true }, // e.g., 2025-W35 or 2025-08-25
    generatedAt: { type: Date, default: () => new Date(), index: -1 },
    entries: { type: [LeaderboardEntrySchema], default: [] },
  },
  { collection: 'leaderboards' }
);

LeaderboardSchema.index({ type: 1, period: 1 });
LeaderboardSchema.index({ generatedAt: -1 });

// PUBLIC_INTERFACE
function getPlayerStatsModel(mongoose) {
  /** Returns/creates the PlayerStats mongoose model bound to the provided mongoose instance. */
  const m = mongoose || require('mongoose');
  return m.models.PlayerStats || m.model('PlayerStats', PlayerStatsSchema);
}

// PUBLIC_INTERFACE
function getLeaderboardModel(mongoose) {
  /** Returns/creates the Leaderboard mongoose model bound to the provided mongoose instance. */
  const m = mongoose || require('mongoose');
  return m.models.Leaderboard || m.model('Leaderboard', LeaderboardSchema);
}

module.exports = { PlayerStatsSchema, LeaderboardSchema, getPlayerStatsModel, getLeaderboardModel };
