exports.handler = async (bot, msg, args, guildState) => {
  const ms = bot.modules.messageSender
  const pf = bot.env.prefix

  await guildState.voiceHandler.leaveVoice(ms, msg.channel)
  ms.info('Leaving voice channel...', msg.channel)
}

exports.info = {
  command: 'leave',
  fullCommand: 'leave',
  shortDescription: '',
  longDescription: ''
}
