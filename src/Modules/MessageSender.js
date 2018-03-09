const moment = require('moment')
const _ = require('lodash')

class MessageSender {
  constructor (client, configs) {
    this.profilePicUrl = client.user.avatarURL
    this.defaultDuration = 10000

    this.footer = {
      icon_url: this.profilePicUrl,
      text: `| v${configs.config.version} - Developed By CF12`
    }
  }

  static _msgDeleter (msg, duration) {
    if (duration > 0) msg.delete(duration)
  }

  info (content, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: '__❱❱ INFO ❱❱__',
        description: content,
        color: 5235199, // Light Blue
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  error (content, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: '__❱❱ ERROR ❱❱__',
        description: content,
        color: 16731983, // Light Red
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  volInfo (volume, channel, duration = this.defaultDuration) {
    channel.send({
      embed: {
        title: '__❱❱ VOLUME ❱❱__',
        description: `Volume has been set to: **${volume}**`,
        color: 5753896, // Light Green
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
