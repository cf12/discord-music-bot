exports.handler = (client, msg, ms, args, pf, state, gh) => {
  ms.info('Pong!', msg.channel)
}

exports.info = {
  command: 'ping',
  fullCommand: 'ping',
  shortDescription: 'Pings the bot',
  longDescription: 'Pings the bot for a "Pong!" response'
}
