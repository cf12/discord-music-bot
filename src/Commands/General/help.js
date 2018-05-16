exports.handler = (bot, msg, args, guild) => {
  const ms = bot.modules.messageSender
  const pf = bot.env.prefix

  if (args.length > 1) ms.error(`Invalid usage: **${pf}help [command]**`, msg.channel)
  else if (args.length === 0) {
    ms.commandsHelp(bot.modules.commandHandler.getCommands(), msg.channel)
  } else if (args.length === 1) {

  }
}

exports.info = {
  command: 'help',
  fullCommand: 'help [command]',
  shortDescription: '',
  longDescription: ''
}
