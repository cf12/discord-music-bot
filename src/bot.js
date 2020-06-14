const Discord = require('discord.js')

const config = require('../config/config.json')
const pf = config.prefix

let bot = new Discord.Client()
bot.login(config.token)
const videoClient = new Discord.Client({_tokenType: 'Bearer'});
videoClient.login(config.videoToken)

let modules

bot.on('ready', () => {
  bot.env = {
    prefix: pf
  }
  bot.user.setPresence({
    activity: { name: config.version }
  })

  bot.modules = modules = {
    consoleLogger: new (require('./Modules/ConsoleLogger'))(),
    commandHandler: new (require('./Modules/CommandHandler'))(),
    messageSender: new (require('./Modules/MessageSender'))(bot),
    guildHandler: new (require('./Modules/GuildHandler'))(bot, videoClient, config.video),
    siteManager: new (require('./sites/SiteManager'))(config.video)
  }

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

bot.on('debug', console.debug)
videoClient.on('debug', console.debug)
