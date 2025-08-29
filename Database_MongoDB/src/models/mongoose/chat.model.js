'use strict';
const { Schema, Types } = require('mongoose');

const FlagsSchema = new Schema(
  {
    moderated: { type: Boolean, default: false },
    removed: { type: Boolean, default: false },
    reason: { type: String, default: null },
  },
  { _id: false }
);

const ChatSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, required: true, index: true },
    fromUserId: { type: Types.ObjectId, default: null, index: true },
    type: { type: String, enum: ['user', 'system', 'moderation'], default: 'user' },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: () => new Date(), index: true },
    flags: { type: FlagsSchema, default: () => ({}) },
  },
  { collection: 'chat_messages' }
);

ChatSchema.index({ roomId: 1, createdAt: 1 });
ChatSchema.index({ fromUserId: 1, createdAt: -1 });

// PUBLIC_INTERFACE
function getChatModel(mongoose) {
  /** Returns/creates the Chat mongoose model bound to the provided mongoose instance. */
  const m = mongoose || require('mongoose');
  return m.models.ChatMessage || m.model('ChatMessage', ChatSchema);
}

module.exports = { ChatSchema, getChatModel };
