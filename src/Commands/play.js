const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const ytsr = require('ytsr')

exports.handler = async (bot, msg, args, guild) => {
  const ms = bot.modules.messageSender
  const cl = bot.modules.consoleLogger
  const sm = bot.modules.siteManager
  const pf = bot.env.prefix
  const vh = guild.voiceHandler

  if (args.length === 0)
    return ms.error(`Invalid usage: **${pf}play [URL / Search Query]**`, msg.channel)
  else if (!msg.member.voice.channel)
    return ms.error(`${msg.member.toString()}, you must be in a voice channel`, msg.channel)
  else if (!msg.member.voice.channel.joinable)
    return ms.error(`I don't have permission to join your voice channel!`, msg.channel)

  const query = args.join(' ')
  let track
  try {
    track = await sm.getVideo(query)
    if (!track) ms.error("Cannot handle video from this site", msg.channel)
  } catch (e) {
    ms.error(e.message, msg.channel)
    return
  }

  if (!guild.voiceState.voiceConnection) {
    guild.setVoiceMsgChannel(msg.channel)
    ms.info(`Joining ${msg.member.toString()}'s voice channel...`, msg.channel)
    await vh.joinVoice(msg.member.voice.channel)
  }

  switch (track.type) {
    case "video":
      vh.addTrack(track, msg.member)
      ms.info(`Video has been queued`, msg.channel)
      break
    case "playlist":
      track.videos.forEach(v => vh.addTrack(v,  msg.member))
      ms.info('Playlist has been queued', msg.channel)
      break
    case "search":
      try {
        const {video, user} = await ms.search(track, msg.channel)
        vh.addTrack(video, user)
      } catch (e) {
        ms.error(e.message, msg.channel)
      }
      break
    default:
      ms.error("Unknown type of video")
  }
}

exports.info = {
  command: 'play',
  alias: [],
  fullCommand: 'play [YouTube URL / Search Query]',
  shortDescription: '',
  longDescription: ''
}
