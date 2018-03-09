exports.handler = async (client, msg, args, guildState, env, modules) => {
  const ms = modules.messageSender
  const pf = env.prefix

  await guildState.voiceHandler.leaveVoice(ms, msg.channel)
  ms.info('Leaving voice channel...', msg.channel)
}

exports.info = {
  command: 'leave',
  fullCommand: 'leave',
  shortDescription: '',
  longDescription: ''
}
