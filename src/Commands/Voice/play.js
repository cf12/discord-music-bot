exports.handler = async (bot, msg, args, guild) => {
  const ms = bot.modules.messageSender
  const cl = bot.modules.consoleLogger
  const pf = bot.env.prefix
  const vh = guild.voiceHandler

  if (args.length !== 1) return ms.error(`Invalid usage: **${pf}play <url>**`, msg.channel)
  if (!msg.member.voiceChannel) return ms.error(`${msg.member.toString()}, you must be in a voice channel`, msg.channel)

  guild.setVoiceMsgChannel(msg.channel)

  try {
    const parsedUrl = vh.parseUrl(args[0])

    if (!guild.voiceState.voiceConnection) {
      ms.info(`Joining ${msg.member.toString()}'s voice channel...`, msg.channel)
      await vh.joinVoice(msg.member.voiceChannel)
    }

    if (parsedUrl.type === 'hybrid') return
    else if (parsedUrl.type === 'video') {
      ms.info(`Video has been queued`, msg.channel)
      vh.addTrack(parsedUrl.id, msg.member)
    } else if (parsedUrl.type === 'playlist') {
      ms.info('Playlist has been queued', msg.channel)
      vh.addPlaylist(parsedUrl.id, msg.member)
    }
  } catch (err) {
    if (err) {
      if (err.message === 'INVALID_LINK') ms.error('Invalid link detected! Links must be valid YouTube URLs.', msg.channel)
      else if (err.message === 'EMPTY_VID') ms.error('Empty video detected!', msg.channel)
      else cl.error(err)
    }
  }
}

exports.info = {
  command: 'play',
  alias: [],
  fullCommand: 'play [YouTube URL]',
  shortDescription: '',
  longDescription: ''
}
