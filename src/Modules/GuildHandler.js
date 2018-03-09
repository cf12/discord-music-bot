const Guild = require('../Components/Guild')

class GuildHandler {
  constructor (modules) {
    this.modules = modules
    this.guilds = {}
  }

  addGuild (id) {
    this.guilds[id] = new Guild(id, this.modules)

    return this.guilds[id]
  }

  getGuild (id) {
    return (this.guilds[id])
      ? this.guilds[id]
      : this.addGuild(id)
  }
}

module.exports = GuildHandler
