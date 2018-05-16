const moment = require('moment')
const _ = require('lodash')

class MessageSender {
  constructor (bot, configs) {
    this.profilePicUrl = bot.user.avatarURL
    this.pf = bot.env.prefix
    this.defaultDuration = 10000

    this.footer = {
      icon_url: this.profilePicUrl,
      text: `| ${configs.config.version} - Developed By CF12`
    }
  }

  _msgDeleter (msg, duration) {
    if (duration > 0) msg.delete(duration)
  }

  info (content, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: ':bulb: __❱❱ INFO ❱❱__',
        description: content,
        color: 5235199, // Light Blue
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  error (content, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: ':warning: __❱❱ ERROR ❱❱__',
        description: content,
        color: 16731983, // Light Red
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  volInfo (volume, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: ':loud_sound: __❱❱ VOLUME ❱❱__',
        description: `Volume has been set to: **${volume}**`,
        color: 5753896, // Light Green
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  commandsHelp (content, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: ':blue_book: __❱❱ ALL COMMANDS ❱❱__',
        description: `To get specific command help, use **${this.pf}help [command]**`,
        color: 3530163, // Light Aqua Green
        fields: content.map(e => {
          return {
            name: e.info.fullCommand,
            value: (e.info.shortDescription) ? e.info.shortDescription : 'This command\'s description has not been written yet because i\'m a lazy whore',
            inline: true
          }
        }),
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  youtubeTrackInfo (content, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: content.title,
        description: content.description,
        color: 14038325, // Light Red
        author: {
          name: 'Now Playing - YouTube™ Video',
          icon_url: this.profilePicUrl
        },
        thumbnail: {
          url: content.thumbnail
        },
        fields: [
          {
            name: 'Uploaded By:',
            value: content.uploader,
            inline: true
          },
          {
            name: 'Duration',
            value: content.duration.format([
              moment.duration(1, 'second'),
              moment.duration(1, 'minute'),
              moment.duration(1, 'hour')
            ], 'd [days] hh:mm:ss'),
            inline: true
          },
          {
            name: 'Requested By:',
            value: content.requester
          },
          {
            name: 'Link',
            value: `https://youtu.be/${content.id}`
          },
          {
            name: 'Tags',
            value: (content.tags) ? content.tags.join(', ') : '[None]',
            inline: true
          }
        ],
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }
}

module.exports = MessageSender
