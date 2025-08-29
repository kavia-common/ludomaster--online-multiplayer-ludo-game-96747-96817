'use strict';
const { Schema } = require('mongoose');

const SystemEventSchema = new Schema(
  {
    type: { type: String, required: true, index: true },
    payload: { type: Object, default: {} },
    createdAt: { type: Date, default: () => new Date(), index: -1 },
    severity: { type: String, enum: ['info', 'warn', 'error'], default: 'info', index: true },
  },
  { collection: 'system_events' }
);

SystemEventSchema.index({ type: 1, createdAt: -1 });
SystemEventSchema.index({ severity: 1, createdAt: -1 });

// PUBLIC_INTERFACE
function getSystemEventModel(mongoose) {
  /** Returns/creates the SystemEvent mongoose model bound to the provided mongoose instance. */
  const m = mongoose || require('mongoose');
  return m.models.SystemEvent || m.model('SystemEvent', SystemEventSchema);
}

module.exports = { SystemEventSchema, getSystemEventModel };
