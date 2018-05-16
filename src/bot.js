const Discord = require('discord.js')
const moduleLoader = require('./Modules/ModuleLoader')
let bot = new Discord.Client()

const configs = require('./Modules/ConfigLoader')()
const pf = configs.config.prefix
bot.login(configs.config.token)

let modules

bot.on('ready', () => {
  bot.env = {
    prefix: pf
  }

  modules = bot.modules = moduleLoader.getModules(bot, configs)

  bot.user.setPresence({ game: {
    name: configs.config.version
  }})

  const cl = modules.consoleLogger
  cl.info('Bot started!')
  cl.info(`Invite Link: https://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot`)
})

bot.on('message', (msg) => {
  if (msg.author.bot || !msg.content.startsWith(pf)) return

  const baseCmd = msg.content.split(' ')[0]
  const cmd = modules.commandHandler.getCommand(baseCmd.slice(pf.length).toLowerCase())

  if (cmd) {
    const guildState = modules.guildHandler.getGuild(msg.guild.id)
    const baseArgs = msg.content.split(' ').slice(1)
    cmd.handler(bot, msg, baseArgs, guildState)
  } else modules.messageSender.error('Command not found', msg.channel)
})
