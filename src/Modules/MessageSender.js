const config = require('../../config/config.json')

const defaultDuration = 0
const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]
const numberEmojiNames = ["one", "two", "three", "four", "five"]

class MessageSender {
  constructor (bot) {
    this.profilePicUrl = bot.user.avatarURL({ size: 32 })
    this.pf = bot.env.prefix

    this.footer = {
      icon_url: this.profilePicUrl,
      text: `| ${config.version} - Developed By CF12`
    }
  }

  _msgDeleter (msg, duration) {
    if (duration > 0) msg.delete({ timeout: duration })
  }

  customEmbed (embed, channel, duration = defaultDuration) {
    const payload = Object.assign(embed, { footer: this.footer })

    channel.send({ embed: payload })
    .then(msg => { this._msgDeleter(msg, duration) })
  }

  info (content, channel, duration = defaultDuration) {
    channel.send({
      embed: {
        title: ':bulb: __❱❱ INFO ❱❱__',
        description: content,
        color: 5235199, // Light Blue
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  error (content, channel, duration = defaultDuration) {
    channel.send({
      embed: {
        title: ':warning: __❱❱ ERROR ❱❱__',
        description: content,
        color: 16731983, // Light Red
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  volInfo (volume, channel, duration = defaultDuration) {
    channel.send({
      embed: {
        title: ':loud_sound: __❱❱ VOLUME ❱❱__',
        description: `Volume has been set to: **${volume}**`,
        color: 5753896, // Light Green
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  youtubeTrackInfo (content, channel, duration = defaultDuration) {
    channel.send({
      embed: {
        title: content.title,
        description: content.description.length > 180 ? content.description.slice(0, 180) + "..." : content.description,
        color: 14038325, // Light Red
        author: {
          name: 'Now Playing - YouTube™ Video',
          icon_url: this.profilePicUrl
        },
        thumbnail: {
          url: content.thumbnailUrl
        },
        fields: [
          {
            name: 'Uploaded By:',
            value: content.author,
            inline: true
          },
          {
            name: 'Duration',
            value: content.duration.format ? content.duration.format('d[d] h[h] m[m] s[s]') : content.duration,
            inline: true
          },
          {
            name: 'Requested By:',
            value: content.requester
          },
          {
            name: 'Link',
            value: `https://youtu.be/${content.id}`
          }
        ],
        footer: this.footer
      }
    }).then(msg => { this._msgDeleter(msg, duration) })
  }

  search (searchInfo, channel, timeout = 10000) {
    return channel.send({
      embed: {
        title: `YouTube videos matching "${searchInfo.query}"`,
        description: searchInfo.results.map((r, i) => `:${numberEmojiNames[i]}: ${r.title}`).join("\n\n"),
          // + (searchInfo.nextPage ? "\n\n:fast_forward: More results" : ""),
        color: 14038325, // Light Red
        author: {
          name: 'Search Results',
          icon_url: this.profilePicUrl
        },
        footer: this.footer
      }
    }).then(msg => new Promise((resolve, reject) => {
      msg.react(numberEmojis[0])
        .then(() => msg.react(numberEmojis[1]))
        .then(() => msg.react(numberEmojis[2]))
        .then(() => msg.react(numberEmojis[3]))
        // .then(() => searchInfo.nextPage ? msg.react("⏩") : {})
        .catch(reject)

      const reactionFilter = (reaction, user) => {
        return numberEmojis.includes(reaction.emoji.name) && !user.bot
      };

      const collector = msg.createReactionCollector(reactionFilter, {time: timeout})

      collector.on('collect', (reaction, user) => {
        const index = numberEmojis.indexOf(reaction.emoji.name)
        resolve({
          video: searchInfo.results[index].video,
          user
        })
      })

      collector.on('end', collected => {
        if (collected.size === 0) reject(new Error("No response to search"))
        msg.delete()
      })
    }))
  }
}

module.exports = MessageSender
