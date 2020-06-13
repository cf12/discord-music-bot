const Guild = require('../Components/Guild')

class GuildHandler {
  constructor (bot, videoClient, videoConfig) {
    this.bot = bot
    this.videoClient = videoClient
    this.guilds = {}
    this.videoConfig = videoConfig
  }

  addGuild (id) {
    this.guilds[id] = new Guild(id, this.bot, this.videoClient, this.videoConfig)
    return this.guilds[id]
  }

  getGuild (id) {
    return (this.guilds[id])
      ? this.guilds[id]
      : this.addGuild(id)
  }
}

module.exports = GuildHandler
