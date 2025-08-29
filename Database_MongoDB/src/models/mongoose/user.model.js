'use strict';
const { Schema, Types, model } = require('mongoose');

const PreferencesSchema = new Schema(
  {
    soundEnabled: { type: Boolean, default: true },
    colorBlindMode: { type: Boolean, default: false },
    locale: { type: String, default: 'en' },
  },
  { _id: false }
);

const StatsSnapshotSchema = new Schema(
  {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    totalTimePlayedSec: { type: Number, default: 0 },
    lastGameAt: { type: Date, default: null },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, lowercase: true, trim: true, index: true, sparse: true, unique: true },
    phone: { type: String, trim: true, index: true, sparse: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    createdAt: { type: Date, default: () => new Date(), index: -1 },
    updatedAt: { type: Date, default: () => new Date() },
    lastLoginAt: { type: Date, default: null },
    status: { type: String, enum: ['active', 'banned', 'inactive'], default: 'active', index: true },
    roles: { type: [String], default: ['user'] },
    preferences: { type: PreferencesSchema, default: () => ({}) },
    statsSnapshot: { type: StatsSnapshotSchema, default: () => ({}) },
  },
  {
    collection: 'users',
  }
);

// Keep updatedAt in sync
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Extra indexes mirroring spec (unique handled above via unique+sparse)
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

// PUBLIC_INTERFACE
function getUserModel(mongoose) {
  /** Returns/creates the User mongoose model bound to the provided mongoose instance. */
  return (mongoose || require('mongoose')).models.User || (mongoose || require('mongoose')).model('User', UserSchema);
}

module.exports = { UserSchema, getUserModel };
