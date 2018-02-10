const Discord = require('discord.js')
const client = new Discord.Client()

const modules = {
  configLoader: require('./Modules/configloader'),
  messageSender: require('./Modules/MessageSender'),
  commandHandler: new (require('./Modules/commandHandler'))(),
  guildHandler: new (require('./Modules/GuildHandler'))()
}

const logger = new (require('./Modules/ConsoleLogger'))()

const configs = modules.configLoader()
const env = {
  prefix: configs.config.prefix
}

const ms = modules.messageSender

client.on('ready', () => {
  client.user.setPresence({
    game: {
      name: `${configs.config.version}`
    }
  })

  logger.info('Bot started!')
})

client.on('message', (msg) => {
  if (msg.author.bot || !msg.content.startsWith(env.prefix)) return

  const baseCmd = msg.content.split(' ')[0]

  const state = modules.guildHandler.getGuild(msg.guild.id)
  const cmd = modules.commandHandler.getCommand(baseCmd.slice(env.prefix.length))

  if (cmd) {
    const baseArgs = msg.content.split(' ').slice(1)
    cmd.handler(client, msg, ms, baseArgs, env.prefix, state, modules.guildHandler)
  } else {
    ms.error('Command not found', msg.channel)
  }
})

client.login(configs.config.token)
