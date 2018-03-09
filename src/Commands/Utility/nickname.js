exports.handler = (client, msg, args, guildState, env, modules) => {
  const ms = modules.messageSender
  const pf = env.prefix

  if (!args.length) return ms.error(`Invalid usage: **${pf}nickname <nickname>**`, msg.channel)

  const user = guildState.getUser(msg.member.id)

  if (msg.createdTimestamp - user.history.nicknameChange < (30 * 60 * 1000)) {
    ms.error(`${msg.member.toString()}, you are still on cooldown for your next nickname change.`, msg.channel)
  } else {
    msg.member.setNickname(args.join(' '))
    user.history.nicknameChange = msg.createdTimestamp
    ms.info('Nickname successfully changed.', msg.channel)
  }
}

exports.info = {
  command: 'nickname',
  fullCommand: 'nickname <nickname>',
  shortDescription: '',
  longDescription: ''
}
