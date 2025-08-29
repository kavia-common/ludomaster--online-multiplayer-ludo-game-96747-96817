'use strict';
const { Schema, Types } = require('mongoose');

const GamePlayerSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, index: true },
    displayName: { type: String, required: true, trim: true },
    color: { type: String, required: true },
    seat: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false }
);

const FinalPlacementSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true },
    place: { type: Number, required: true, min: 1, max: 4 },
  },
  { _id: false }
);

const MoveSchema = new Schema(
  {
    t: { type: Date, required: true },
    by: { type: Types.ObjectId, required: false },
    dice: { type: Number, default: null },
    tokenId: { type: String, default: null },
    from: { type: String, default: null },
    to: { type: String, default: null },
    type: { type: String, required: true, enum: ['roll', 'move', 'capture', 'enter', 'finish', 'system'] },
  },
  { _id: false }
);

const IntegritySchema = new Schema(
  {
    seed: { type: String, default: null },
    hash: { type: String, default: null },
  },
  { _id: false }
);

const GameSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, required: true, index: true },
    players: { type: [GamePlayerSchema], default: [] },
    winner: { type: Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress', index: true },
    startedAt: { type: Date, default: () => new Date(), index: -1 },
    endedAt: { type: Date, default: null },
    durationSec: { type: Number, default: null, min: 0 },
    finalPlacements: { type: [FinalPlacementSchema], default: [] },
    moves: { type: [MoveSchema], default: [] },
    integrity: { type: IntegritySchema, default: () => ({}) },
  },
  { collection: 'games' }
);

GameSchema.index({ roomId: 1, startedAt: -1 });
GameSchema.index({ status: 1, startedAt: -1 });
GameSchema.index({ 'players.userId': 1, startedAt: -1 });
GameSchema.index({ winner: 1, endedAt: -1 });

// PUBLIC_INTERFACE
function getGameModel(mongoose) {
  /** Returns/creates the Game mongoose model bound to the provided mongoose instance. */
  const m = mongoose || require('mongoose');
  return m.models.Game || m.model('Game', GameSchema);
}

module.exports = { GameSchema, getGameModel };
