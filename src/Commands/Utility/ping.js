exports.handler = (bot, msg, args, guild) => {
  const ms = bot.modules.messageSender

  ms.info('Pong!', msg.channel)
}

exports.info = {
  command: 'ping',
  alias: [],
  fullCommand: 'ping',
  shortDescription: 'Pings the bot',
  longDescription: 'Pings the bot for a "Pong!" response'
}
