const ytdl = require('ytdl-core')
const moment = require('moment')

function selectFormat(formats, resolutionMax, resolutionSoftMin) {
  const livestream = formats.some(f => f.live)
  const highestRes = Math.max.apply(Math, formats.map(format => format.height || 0))
  const highestFrameRate = Math.max.apply(Math, formats.map(format => format.fps || 0))

  let chosenFormat = {
    height: (highestRes >= resolutionSoftMin ? resolutionSoftMin : highestRes) - 1,
    fake: true
  }

  for (const format of formats) {
    if (!format.height && format.qualityLabel) format.height = parseInt(format.qualityLabel.slice(0, format.qualityLabel.indexOf("p")))
    if (
      format.audioBitrate &&
      format.height > chosenFormat.height &&
      format.height <= resolutionMax &&
      !format.qualityLabel.includes("HDR") &&
      (format.fps === highestFrameRate || livestream) &&
      (livestream === format.live)
    ) {
      chosenFormat = format
    }
  }

  if (!chosenFormat.fake) return chosenFormat

  for (const format of formats) {
    if (
      format.height > chosenFormat.height &&
      format.height <= resolutionMax &&
      !format.qualityLabel.includes("HDR") &&
      (format.fps === highestFrameRate || livestream) &&
      (livestream === format.live)
    ) {
      chosenFormat = format
    }
  }

  if (!chosenFormat.fake) return chosenFormat

  chosenFormat.height = -1
  for (const format of formats) {
    if (
      format.height > chosenFormat.height &&
      format.height <= resolutionMax &&
      (livestream === format.live)
    ) {
      chosenFormat = format
    }
  }

  if (!chosenFormat.fake) return chosenFormat
  return false
}

exports.getVideo = async (url, videoConfig) => {
  if (!ytdl.validateURL(url)) return false
  const info = await ytdl.getInfo(url)

  const format = selectFormat(info.formats, videoConfig.resolutionMax, videoConfig.resolutionSoftMin)
  if (!format) throw new Error("Could not find a format for this video")

  const ytdlOptions = {
    format,
    liveBuffer: videoConfig.liveBuffer
  }

  return {
    type: "video",
    title: info.videoDetails.title,
    description: info.videoDetails.shortDescription,
    author: info.videoDetails.author.name,
    thumbnailUrl: info.player_response.videoDetails.thumbnail.thumbnails[0].url,
    duration: format.live ? "Live" : moment.duration(parseInt(info.videoDetails.lengthSeconds), "seconds"),
    getStreams: () => format.audioBitrate ? {
      both: ytdl.downloadFromInfo(info, ytdlOptions)
    } : {
      audio: ytdl.downloadFromInfo(info, { filter: 'audioonly' }),
      video: ytdl.downloadFromInfo(info, ytdlOptions)
    }
  }
}