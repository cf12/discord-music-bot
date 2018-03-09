const Gdax = require('gdax')
const publicClient = new Gdax.PublicClient()

let currencies

publicClient.getCurrencies((err, res, data) => {
  if (err) throw err
  currencies = data.map(e => e.id)
})

exports.handler = (bot, msg, args, guild) => {
  const ms = bot.modules.messageSender

  args = args.map(e => e.toUpperCase())

  // Command Verifier
  if (args.length !== 2) {
    ms.error(`Invalid usage. Valid usage: **${exports.info.fullCommand}**`, msg.channel)
    return
  } else if (!(currencies.includes(args[0]) || currencies.includes(args[1]))) {
    ms.error(`Invalid currency. Valid currencies: **${currencies.join(', ')}**`, msg.channel)
    return
  }

  // Command Handler
  publicClient.getProductOrderBook(args[0] + '-' + args[1], (err, res, book) => {
    if (err) throw err

    if ('bids' in book) ms.info(`${args[0]} ==> ${args[1]}\n**${book.bids[0][0]}**`, msg.channel, 10000)
    else ms.error('The specified entry was not found', msg.channel)
  })
}

exports.info = {
  command: 'cmarket',
  fullCommand: 'cmarket <from> <to>',
  shortDescription: '',
  longDescription: ''
}
