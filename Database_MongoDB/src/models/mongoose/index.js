'use strict';
/**
 * Central exports for Mongoose models and connector.
 * Backend can: const { getMongoose, models } = require('.../Database_MongoDB/src/models/mongoose');
 */
const { getMongoose } = require('../../db/mongoose');
const { getUserModel } = require('./user.model');
const { getRoomModel } = require('./room.model');
const { getGameModel } = require('./game.model');
const { getChatModel } = require('./chat.model');
const { getPlayerStatsModel, getLeaderboardModel } = require('./stats.model');
const { getSystemEventModel } = require('./systemEvents.model');

// PUBLIC_INTERFACE
async function initMongooseModels() {
  /**
   * Ensures a connected mongoose instance and returns bound models.
   * Returns: { mongoose, User, Room, Game, ChatMessage, PlayerStats, Leaderboard, SystemEvent }
   */
  const mongoose = await getMongoose();
  const User = getUserModel(mongoose);
  const Room = getRoomModel(mongoose);
  const Game = getGameModel(mongoose);
  const ChatMessage = getChatModel(mongoose);
  const PlayerStats = getPlayerStatsModel(mongoose);
  const Leaderboard = getLeaderboardModel(mongoose);
  const SystemEvent = getSystemEventModel(mongoose);

  return { mongoose, User, Room, Game, ChatMessage, PlayerStats, Leaderboard, SystemEvent };
}

// PUBLIC_INTERFACE
function getModelsSync(mongoose) {
  /**
   * Returns models bound to the provided mongoose instance without connecting.
   * Useful for testing when a connection is already established.
   */
  const User = getUserModel(mongoose);
  const Room = getRoomModel(mongoose);
  const Game = getGameModel(mongoose);
  const ChatMessage = getChatModel(mongoose);
  const PlayerStats = getPlayerStatsModel(mongoose);
  const Leaderboard = getLeaderboardModel(mongoose);
  const SystemEvent = getSystemEventModel(mongoose);

  return { User, Room, Game, ChatMessage, PlayerStats, Leaderboard, SystemEvent };
}

module.exports = { getMongoose, initMongooseModels, getModelsSync };
