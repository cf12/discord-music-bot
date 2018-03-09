const Guild = require('../Components/Guild')

class GuildHandler {
  constructor (bot) {
    this.bot = bot
    this.guilds = {}
  }

  addGuild (id) {
    this.guilds[id] = new Guild(id, this.bot)
    return this.guilds[id]
  }

  getGuild (id) {
    return (this.guilds[id])
      ? this.guilds[id]
      : this.addGuild(id)
  }
}

module.exports = GuildHandler
