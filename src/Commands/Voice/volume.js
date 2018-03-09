exports.handler = async (bot, msg, args, guild) => {
  const cl = bot.modules.consoleLogger
  const ms = bot.modules.messageSender
  const pf = bot.env.prefix
  const vh = guild.voiceHandler

  if (args[0] <= 0 || args[0] > 100) return ms.error('Invalid Volume Input! Value must be between 1 and 100', msg.channel)
  else if (!msg.member.voiceChannel || (msg.member.voiceChannel.id !== guild.voiceState.voiceConnection.channel.id)) return ms.error(`You must be in the bot's voice channel!`, msg.channel)

  try {
    const volume = await vh.setVolume(args[0])
    ms.volInfo(volume, msg.channel)
  } catch (err) {
    if (err) cl.error(err)
  }
}

exports.info = {
  command: 'volume',
  fullCommand: 'volume <1 - 100>',
  shortDescription: '',
  longDescription: ''
}
