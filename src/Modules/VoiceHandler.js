const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')
const ytdl = require('ytdl-core')

momentDurationFormatSetup(moment)

class VoiceHandler {
  constructor (voiceState, modules) {
    this.cl = modules.consoleLogger
    this.yh = modules.youtubeHandler
    this.ms = modules.messageSender
    this.state = voiceState
  }

  parseUrl (url) {
    if (url.includes('youtube.com') && url.includes('watch?v=') && url.includes('&list=')) {
      return {
        type: 'hybrid',
        videoID: url.split('watch?v=')[1].split('#')[0].split('&')[0],
        playlistID: url.split('&list=')[1].split('#')[0].split('&')[0]
      }
    } else if (url.includes('youtube.com') && url.includes('watch?v=')) {
      return {
        type: 'video',
        id: url.split('watch?v=')[1].split('#')[0].split('&')[0]
      }
    } else if (url.includes('youtu.be')) {
      return {
        type: 'video',
        id: url.split('be/')[1].split('?')[0]
      }
    } else if (url.includes('youtube.com') && url.includes('playlist?list=')) {
      return {
        type: 'playlist',
        id: url.split('playlist?list=')[1]
      }
    } else throw new Error('INVALID_LINK')
  }

  async addTrack (id, requester) {
    return new Promise(async (resolve, reject) => {
      const data = (await this.yh.getVideo(id)).items[0]

      const snippet = data.snippet
      const track = {
        id: data.id,
        url: 'http://youtube.com/watch?v=' + data.id,
        title: snippet.title,
        description: (snippet.description.length > 180)
          ? snippet.description.slice(0, 180) + '...'
          : snippet.description,
        uploader: snippet.channelTitle,
        requester: requester.toString(),
        thumbnail: snippet.thumbnails.high.url,
        duration: moment.duration(data.contentDetails.duration),
        tags: snippet.tags
      }

      this.state.queue.push(track)
      if (!this.state.nowPlaying) {
        await this.playNextTrack()
      }
      resolve()
    })
  }

  async addPlaylist (id, requester) {
    return new Promise(async (resolve, reject) => {
      const playlist = await this.yh.getPlaylist(id)
      playlist.forEach(e => { this.addTrack(e, requester) })

      resolve()
    })
  }

  async playNextTrack () {
    return new Promise(async (resolve, reject) => {
      const track = this.state.queue.shift()
      const stream = ytdl(track.url)

      const dispatcher = await this.state.voiceConnection.playStream(stream)

      dispatcher.setVolume(this.state.volume)
      this.state.voiceDispatcher = dispatcher

      this.ms.youtubeTrackInfo(track, this.state.msgChannel)
      this.cl.info(`Playing track: [${track.title}] in voice channel [${this.state.voiceConnection.channel.name}]`)
      this.state.nowPlaying = track

      dispatcher.once('end', () => {
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

      resolve()
    })
  }

  async joinVoice (voiceChannel) {
    return new Promise((resolve, reject) => {
      voiceChannel.join()
        .then((connection) => {
          this.state.voiceConnection = connection

          this.cl.info(`Joined voice channel: [${voiceChannel.id}] on guild [${voiceChannel.guild.name}]`)
          resolve()
        })
        .catch(err => { if (err) reject(err) })
    })
  }

  async leaveVoice () {
    return new Promise(async (resolve, reject) => {
      if (!this.state.voiceConnection) reject(new Error('NOT_IN_VOICE'))

      this.state.voiceDispatcher.removeAllListeners('end')
      await this.state.voiceConnection.disconnect()
      this.state.voiceConnection = undefined
      this.state.voiceDispatcher = undefined
      this.state.nowPlaying = undefined
      this.state.queue = []

      resolve()
    })
  }

  async setVolume (volume) {
    return new Promise((resolve, reject) => {
      const convertedVolume = volume * 0.006

      this.state.volume = convertedVolume
      if (this.state.voiceDispatcher) this.state.voiceDispatcher.setVolumeLogarithmic(convertedVolume)

      resolve(volume)
    })
  }
}

module.exports = VoiceHandler
