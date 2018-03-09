exports.handler = (client, msg, args, guildState, env, modules) => {
  const ms = modules.messageSender

  ms.info('Pong!', msg.channel)
}

exports.info = {
  command: 'ping',
  fullCommand: 'ping',
  shortDescription: 'Pings the bot',
  longDescription: 'Pings the bot for a "Pong!" response'
}
