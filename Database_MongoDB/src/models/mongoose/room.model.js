'use strict';
const { Schema, Types } = require('mongoose');

const RoomPlayerSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, index: true },
    joinedAt: { type: Date, default: () => new Date() },
    team: { type: String, default: null },
    color: { type: String, default: null }, // red|green|blue|yellow
    isReady: { type: Boolean, default: false },
  },
  { _id: false }
);

const GameSettingsSchema = new Schema(
  {
    allowSpectators: { type: Boolean, default: true },
    turnTimerSec: { type: Number, default: null, min: 0 },
    diceFairness: { type: String, enum: ['secure_random', 'server_seed'], default: 'secure_random' },
    aiFill: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoomSchema = new Schema(
  {
    code: { type: String, trim: true, index: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    isPrivate: { type: Boolean, default: false, index: true },
    ownerId: { type: Types.ObjectId, required: true, index: true },
    maxPlayers: { type: Number, enum: [2, 3, 4], default: 4 },
    players: { type: [RoomPlayerSchema], default: [] },
    status: { type: String, enum: ['waiting', 'in_progress', 'completed', 'closed'], default: 'waiting', index: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date(), index: -1 },
    gameSettings: { type: GameSettingsSchema, default: () => ({}) },
    currentGameId: { type: Types.ObjectId, default: null },
  },
  { collection: 'rooms' }
);

RoomSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

RoomSchema.index({ isPrivate: 1, status: 1, createdAt: -1 });
RoomSchema.index({ ownerId: 1, createdAt: -1 });
RoomSchema.index({ status: 1, updatedAt: -1 });

// PUBLIC_INTERFACE
function getRoomModel(mongoose) {
  /** Returns/creates the Room mongoose model bound to the provided mongoose instance. */
  const m = mongoose || require('mongoose');
  return m.models.Room || m.model('Room', RoomSchema);
}

module.exports = { RoomSchema, getRoomModel };
