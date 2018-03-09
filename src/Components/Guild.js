const User = require('./User')
const VoiceHandler = require('../Modules/VoiceHandler')

class Guild {
  constructor (id, consoleLogger) {
    this.cl = consoleLogger
    this.id = id
    this.users = {}
    this.timers = {}
    this.voiceState = {
      queue: [],
      msgChannel: undefined,
      voiceConnection: undefined,
      voiceDispatcher: undefined,
      volume: 1,
      nowPlaying: undefined,
      prevTrack: undefined
    }

    this.voiceHandler = new VoiceHandler(this.voiceState, this.cl)
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
