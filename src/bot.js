const Discord = require('discord.js')
const client = new Discord.Client()

const configs = require('./Modules/ConfigLoader')()
const env = {
  prefix: configs.config.prefix
}

client.login(configs.config.token)

let modules
let cl

client.on('ready', () => {
  client.user.setPresence({
    game: {
      name: `v${configs.config.version}`
    }
  })

  modules = require('./Modules/ModuleLoader').getModules(client, configs)
  cl = modules.consoleLogger

  cl.info('Bot started!')
  cl.info(`Invite Link: https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`)
})

client.on('message', (msg) => {
  if (msg.author.bot || !msg.content.startsWith(env.prefix)) return

  const baseCmd = msg.content.split(' ')[0]

  const guildState = modules.guildHandler.getGuild(msg.guild.id)
  const cmd = modules.commandHandler.getCommand(baseCmd.slice(env.prefix.length).toLowerCase())

  if (cmd) {
    const baseArgs = msg.content.split(' ').slice(1)
    cmd.handler(client, msg, baseArgs, guildState, env, {
      messageSender: modules.messageSender,
      consoleLogger: modules.consoleLogger
    })
  } else {
    modules.messageSender.error('Command not found', msg.channel)
  }
})
