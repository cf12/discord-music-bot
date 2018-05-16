exports.handler = (bot, msg, args, guild) => {
  const ms = bot.modules.messageSender
  const cl = bot.modules.consoleLogger
  const vh = guild.voiceHandler
  const pf = bot.env.prefix

  if (args.length !== 0) return ms.error(`Invalid usage: **${pf}skip**`, msg.channel)
  else if (!guild.voiceState.voiceConnection) return ms.error(`Bot is not in voice!`, msg.channel)
  else if (!msg.member.voiceChannel || (msg.member.voiceChannel.id !== guild.voiceState.voiceConnection.channel.id)) return ms.error(`You must be in the bot's voice channel!`, msg.channel)

  if (msg.member.roles.find(e => e.name.toUpperCase() === 'DJ')) vh.skipTrack(msg.channel)
  else ms.error('Sorry, but you don\'t have the DJ role!', msg.channel)
}

exports.info = {
  command: 'skip',
  fullCommand: 'skip',
  shortDescription: 'Places a vote to skip the current track (Users with a "DJ" role can override)',
  longDescription: ''
}
