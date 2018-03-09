module.exports.getModules = (bot, configs) => {
  return {
    consoleLogger: new (require('./ConsoleLogger'))(),
    commandHandler: new (require('./CommandHandler'))(),
    messageSender: new (require('./MessageSender'))(bot, configs),
    guildHandler: new (require('./GuildHandler'))(bot),
    youtubeHandler: new (require('./YoutubeHandler'))(configs.config.ytApiKey)
  }
}
