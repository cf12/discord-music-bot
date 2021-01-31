const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')
const ytdl = require('ytdl-core')

momentDurationFormatSetup(moment)

class VoiceHandler {
  constructor (voiceState, bot, videoClient, videoConfig) {
    const modules = bot.modules

    this.cl = modules.consoleLogger
    this.ms = modules.messageSender
    this.state = voiceState
    this.videoClient = videoClient
    this.videoConfig = videoConfig
  }

  addTrack (track, requester) {
    this.state.queue.push({
      ...track,
      requester
    })
    if (!this.state.nowPlaying) {
      this.playNextTrack().then()
    }
  }

  finishTrack () {
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
  }

  async playNextTrack () {
    const track = this.state.queue.shift()

    this.ms.youtubeTrackInfo(track, this.state.msgChannel)
    this.cl.info(`Playing track: [${track.title}] in voice channel [${this.state.voiceConnection.channel.name}]`)

    this.resetVoteHandlers()
    this.state.nowPlaying = track

    const streams = track.getStreams()

    if (streams.both) {
      this.state.dispatchers = await this.state.voiceConnection.playVideo(streams.both, {
        bitrate: this.videoConfig.bitrate,
        useNvenc: this.videoConfig.useNvenc,
        useVaapi: this.videoConfig.useVaapi,
        rtBufferSize: this.videoConfig.rtBufferSize,
        audioDelay: this.videoConfig.coupledAudioDelay
      })
      this.state.dispatchers.audio.setVolume(this.state.volume)

      this.state.voiceConnection.videoPlayer.once('finish', () => {
        this.finishTrack()
      })
    } else if (streams.video) {
      this.state.dispatchers = await this.state.voiceConnection.playVideo(streams, {
        bitrate: this.videoConfig.bitrate,
        useNvenc: this.videoConfig.useNvenc,
        useVaapi: this.videoConfig.useVaapi,
        rtBufferSize: this.videoConfig.rtBufferSize,
        audioDelay: this.videoConfig.separateAudioDelay
      })

      this.state.voiceConnection.videoPlayer.once('finish', () => {
        this.finishTrack()
      })
    } else {
      this.state.dispatchers = {audio: await this.state.voiceConnection.play(streams.audio)}
      this.state.dispatchers.audio.setVolume(this.state.volume)

      if (track.thumbnailUrl)
        this.state.dispatchers.video =
          (await this.state.voiceConnection.playVideo(track.thumbnailUrl, {audio: false})).video

      this.state.dispatchers.audio.once('finish', () => {
        this.finishTrack()
      })
    }
  }

  async joinVoice (vChannel) {
    try {
      const videoClientChannel = this.videoClient.channels.resolve(vChannel.id)
      this.state.voiceConnection = await videoClientChannel.join({ video: true, audioDelay: 3000 })
      this.cl.info(`Joined voice channel: [${vChannel.id}] on guild [${vChannel.guild.name}]`)
    } catch (err) { throw new Error(err) }
  }

  async leaveVoice () {
    if (!this.state.voiceConnection || !this.state.dispatchers) return

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
  }

  resetVoteHandlers () {
    Object.values(this.state.voteHandlers).forEach(handler => handler.reset())
  }
}

module.exports = VoiceHandler
