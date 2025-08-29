# Mongoose Models for LudoMaster

This directory provides Mongoose schemas and models mirroring the MongoDB collections described in the project schema:

- User (users)
- Room (rooms)
- Game (games)
- ChatMessage (chat_messages)
- PlayerStats (player_stats)
- Leaderboard (leaderboards)
- SystemEvent (system_events, optional)

How to use (in backend):

1) Ensure environment variables are set (see ../../.env.example).
2) Initialize models:
   const { initMongooseModels } = require('path/to/Database_MongoDB/src/models/mongoose');
   const { User, Room, Game, ChatMessage, PlayerStats, Leaderboard } = await initMongooseModels();

3) Use models as usual with Mongoose:
   const user = await User.findOne({ email: 'example@test.com' });
   const rooms = await Room.find({ isPrivate: false, status: 'waiting' }).sort({ createdAt: -1 }).limit(20);

Index management:
- The schemas declare indexes. Run:
  node Database_MongoDB/scripts/initMongoose.js
  to ensure indexes are created in your environment.

Note:
- This layer is optional. You can also use the native MongoDB driver helpers in ../..
