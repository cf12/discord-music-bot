const _ = require('lodash')

function sendInfo (content, channel, duration = 5000) {
  const embed = { embed: {
    title: ':bulb: __❱❱ [INFO] ❱❱__ :bulb:',
    description: content,
    color: 5235199, // Light Blue
    footer: {
      icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      text: 'Command Received!'
    }
  }}

  channel.send(embed)
  .then((msg) => { if (duration > 0) msg.delete(duration) })
}

function sendError (content, channel, duration = 5000) {
  channel.send({
    embed: {
      title: ':warning: __❱❱ [ERROR] ❱❱__ :warning:',
      description: content,
      color: 16731983 // Light Red
    }
  })
  .then((msg) => { if (duration > 0) msg.delete(duration) })
}

module.exports = {
  info: sendInfo,
  error: sendError
}
