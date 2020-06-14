const youtubedl = require('youtube-dl')
const needle = require('needle')
const moment = require('moment')
const url = require('url')

const FORMAT_KW_BLACKLIST = ["gif", "dash"]

function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    youtubedl.getInfo(url, (err, info) => {
      if (err) reject(err)
      else resolve(info)
    })
  })
}

function selectFormat(formats, resolutionMax, resolutionSoftMin) {
  const hasVideo = formats.some(f => f.vcodec !== "none")

  if (!hasVideo) return {
    audio: (formats.some(f => f.abr) ? formats.sort((a, b) => b.abr - a.abr) : formats)[0]
  }
  let filteredFormats = formats.filter(f => !f.fragments && !FORMAT_KW_BLACKLIST.some(k => f.format_id.includes(k)))
  const highestRes = Math.max.apply(Math, filteredFormats.map(format => format.height || 0))
  const resolutionMin = highestRes < resolutionSoftMin ? highestRes : resolutionSoftMin

  filteredFormats = filteredFormats
    .filter(f => f.height <= resolutionMax && resolutionMin <= f.height)
    .filter(f => f.vcodec !== "none")

  const hasAudio = filteredFormats.some(f => f.acodec !== "none")
  if (hasAudio)
    filteredFormats = filteredFormats.filter(f => f.acodec !== "none")

  if (filteredFormats.length === 0) throw new Error("Could not find suitable format")
  filteredFormats.sort((a, b) => {
    if (a.height !== b.height)
      return b.height - a.height
    else
      return b.fps - a.fps
  })
  console.log(filteredFormats)
  if (hasAudio) {
    return {
      both: filteredFormats[0]
    }
  } else {
    return {
      video: filteredFormats[0],
      audio: formats.filter(f => f.acodec !== "none" && f.vcodec === "none")[0]
    }
  }
}

exports.getVideo = async (url, videoConfig) => {
  let info
  try {
    info = await getVideoInfo(url)
  } catch {
    return false
  }

  if (info.playlist) return false
  console.log(info)

  const formats = selectFormat(info.formats, videoConfig.resolutionMax, videoConfig.resolutionSoftMin)
  const thumbnailUrl = info.thumbnails ? (info.thumbnails.some(t => t.height) ?
    info.thumbnails.sort((a, b) => b.height - a.height) :
    info.thumbnails
  )[0].url : ""

  return {
    type: "video",
    title: info.title,
    description: info.description,
    author: info.uploader,
    thumbnailUrl,
    duration: info.is_live ? "Live" : moment.duration(parseInt(info._duration_raw || "0"), "seconds"),
    getStreams: () => formats.both ? {
      both: formats.both.url,
    } : {
      audio: formats.audio.url,
      ...(formats.video ? {video: formats.video.url} : {})
    }
  }
}
