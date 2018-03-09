function getModules (client, configs) {
  const modules = {
    consoleLogger: new (require('./ConsoleLogger'))(),
    commandHandler: new (require('./commandHandler'))()
  }

  modules.messageSender = new (require('./MessageSender'))(client, configs)
  modules.guildHandler = new (require('./GuildHandler'))(modules)
  modules.youtubeHandler = new (require('./YoutubeHandler'))(configs.config.ytApiKey)

  return modules
}

module.exports.getModules = getModules
