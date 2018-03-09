exports.handler = (client, msg, args, guild, env, modules) => {
  const ms = modules.messageSender
  const cl = modules.consoleLogger
  const pf = env.prefix

  if (args.length !== 0) return ms.error(`Invalid usage: **${pf}skip**`, msg.channel)
  else if (!guild.voiceState.voiceConnection) return ms.error(`Bot is not in voice!`, msg.channel)
  else if (!msg.member.voiceChannel || (msg.member.voiceChannel.id !== guild.voiceState.voiceConnection.channel.id)) return ms.error(`You must be in the bot's voice channel!`, msg.channel)

  if (msg.member.roles.find(e => e.name.toUpperCase() === 'DJ')) cl.info('success!')
}

exports.info = {
  command: 'skip',
  fullCommand: 'skip',
  shortDescription: 'Places a vote to skip the current track (Users with a "DJ" role can override)',
  longDescription: ''
}
