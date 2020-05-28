const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')
const ytdl = require('ytdl-core')
const ytdlDiscord = require('ytdl-core-discord')

momentDurationFormatSetup(moment)

class VoiceHandler {
  constructor (voiceState, bot, videoConfig) {
    const modules = bot.modules

    this.cl = modules.consoleLogger
    this.ms = modules.messageSender
    this.state = voiceState
    this.videoConfig = videoConfig
  }


  async addTrack (id, requester) {
    const data = await ytdl.getInfo(id)
    let highestRes = Math.max.apply(Math, data.formats.map(format => format.width || 0))
    let highestFrameRate = Math.max.apply(Math, data.formats.map(format => format.fps || 0))
    let highest = {
      height: (highestRes >= 720 ? 720 : highestRes) - 1,
      fake: true
    }
    const livestream = data.formats.some(f => f.live)
    for (const format of data.formats) {
      if (!format.height && format.qualityLabel) format.height = parseInt(format.qualityLabel.slice(0, format.qualityLabel.indexOf("p")))
      if (
        format.audioBitrate &&
        format.height > highest.height &&
        format.height <= this.videoConfig.resolutionMax &&
        !format.qualityLabel.includes("HDR") &&
        (format.fps === highestFrameRate || livestream) &&
        (livestream === format.live)
    ) {
        highest = format
      }
    }

    const track = {
      id: data.video_id,
      title: data.title,
      description: (data.description.length > 180)
        ? data.description.slice(0, 180) + '...'
        : data.description,
      uploader: data.author.name,
      requester: requester.toString(),
      thumbnail: data.player_response.videoDetails.thumbnail.thumbnails[0].url,
      duration: moment.duration(parseInt(data.length_seconds)),
      highestFrameRate,
      livestream
    }
    if (!highest.fake) track.format = highest
    else {
      let optimal = {
        height: (highestRes >= 720 ? 720 : highestRes) - 1,
        fake: true
      }
      for (const format of data.formats) {
        if (
          format.height > optimal.height &&
          format.height <= this.videoConfig.resolutionMax &&
          !format.qualityLabel.includes("HDR") &&
          (format.fps === highestFrameRate || livestream) &&
          (livestream === format.live)
        ) {
          optimal = format
        }
      }
      if (!optimal.fake) track.format = optimal
    }

    this.state.queue.push(track)
    if (!this.state.nowPlaying) {
      await this.playNextTrack()
    }
  }

  async addPlaylist (id, requester) {
    const playlist = await this.yh.getPlaylist(id)
    playlist.forEach(e => { this.addTrack(e, requester) })
  }

  async playNextTrack () {
    const track = this.state.queue.shift()

    this.ms.youtubeTrackInfo(track, this.state.msgChannel)
    this.cl.info(`Playing track: [${track.title}] in voice channel [${this.state.voiceConnection.channel.name}]`)

    this.resetVoteHandlers()
    this.state.nowPlaying = track

    if (track.format) {
      this.cl.info(`Selected format: ${track.format.qualityLabel} ${track.format.width}x${track.format.height} ${track.format.fps} fps audio bitrate: ${track.format.audioBitrate} live: ${track.format.live}`)
    }

    if (track.format && track.format.audioBitrate) {
      this.state.dispatchers = await this.state.voiceConnection.playVideo(ytdl(track.id, {format: track.format}), {
        bitrate: this.videoConfig.bitrate,
        useNvenc: this.videoConfig.useNvenc,
      })
    } else {
      const videoStream = track.format ? ytdl(track.id, {format: track.format})
        : ytdl(track.id, {filter: format => (format.height || 0) <= this.videoConfig.resolutionMax && format.live === track.livestream})
      const audioStream = await ytdlDiscord(track.id)

      this.state.dispatchers = await this.state.voiceConnection.playVideo(videoStream, {
        bitrate: this.videoConfig.bitrate,
        useNvenc: this.videoConfig.useNvenc,
        audio: false,
      })

      this.state.dispatchers.audio = await this.state.voiceConnection.play(audioStream, {type: "opus"})
    }
    this.state.dispatchers.audio.setVolume(this.state.volume)

    this.state.voiceConnection.videoPlayer.once('finish', () => {
      this.state.prevTrack = this.state.nowPlaying

      if (this.state.queue.length === 0) {
        this.ms.info('Queue has been emptied. Leaving voice channel...', this.state.msgChannel)
        this.state.nowPlaying = undefined
        this.leaveVoice()
      } else if (this.state.voiceConnection.channel.members.array().length === 1) {
        this.ms.info('Empty voice channel detected. Leaving voice channel...', this.state.msgChannel)
        this.state.nowPlaying = undefined
        this.leaveVoice()
      } else this.playNextTrack()
    })
  }

  async joinVoice (vChannel) {
    try {
      this.state.voiceConnection = await vChannel.join({ video: true, stealthVideo: true })
      this.cl.info(`Joined voice channel: [${vChannel.id}] on guild [${vChannel.guild.name}]`)
    } catch (err) { throw new Error(err) }
  }

  async leaveVoice () {
    if (!this.state.voiceConnection) reject(new Error('NOT_IN_VOICE'))

    const { audio, video } = this.state.dispatchers

    audio.removeAllListeners('end')
    await this.state.voiceConnection.disconnect()

    this.state.voiceConnection = undefined
    this.state.dispatchers = undefined
    this.state.nowPlaying = undefined
    this.state.queue = []

    this.resetVoteHandlers()
  }

  setVolume (volume) {
    const { audio } = this.state.dispatchers
    if (audio) audio.setVolume(volume)
    return volume
  }

  async skipTrack () {
    const { player, videoPlayer } = this.state.voiceConnection

    player.destroy()
    videoPlayer.destroy()

    if (this.state.queue.length > 0) await this.playNextTrack()
  }

  resetVoteHandlers () {
    Object.values(this.state.voteHandlers).forEach(handler => handler.reset())
  }
}

module.exports = VoiceHandler
