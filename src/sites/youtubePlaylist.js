const ytpl = require('ytpl')
const youtube = require('./youtube')

exports.getVideo = async (url, videoConfig) => {
  if (!ytpl.validateID(url)) return false
  const playlist = await ytpl(url)
  const videos = await Promise.all(playlist.items.map(
    v => youtube.getVideo(v.url_simple, videoConfig)
  ))
  for (const v of videos) {
    if (!v) throw new Error("Could not download a video in the playlist")
  }

  return {
    type: "playlist",
    title: playlist.title,
    videos
  }
}
