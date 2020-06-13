const User = require('./User')
const VoiceHandler = require('../Modules/VoiceHandler')
const VoteHandler = require('../Modules/VoteHandler')

class Guild {
  constructor (id, bot, videoClient, videoConfig) {
    this.bot = bot
    this.id = id
    this.users = {}
    this.timers = {}
    this.videoClient = videoClient
    this.videoConfig = videoConfig
    this.voiceState = {
      queue: [],
      msgChannel: undefined,
      voiceConnection: undefined,
      dispatchers: undefined,
      volume: 1,
      nowPlaying: undefined,
      prevTrack: undefined,
      voteHandlers: {
        skip: new VoteHandler(),
        leave: new VoteHandler()
      }
    }

    this.voiceHandler = new VoiceHandler(this.voiceState, this.bot, this.videoClient, this.videoConfig)
  }

  addUser (id) {
    this.users[id] = new User(id)
    return this.users[id]
  }

  getUser (id) {
    return (this.users[id])
      ? this.users[id]
      : this.addUser(id)
  }

  setVoiceMsgChannel (channel) {
    if (this.voiceState.msgChannel !== channel) this.voiceState.msgChannel = channel
  }
}

module.exports = Guild
