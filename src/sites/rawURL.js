const url = require('url')
const path = require('path')

const EXTENSION_WHITELIST = ["m3u8", "mp4", "webm"]

exports.getVideo = async (url, videoConfig) => {
  try {
    const urlInfo = new URL(url)
    const urlPath = path.parse(urlInfo.pathname)
    if (EXTENSION_WHITELIST.includes(urlPath.ext))
      return {
        type: "video",
        title: "Unknown",
        description: "Raw Video File",
        author: "",
        thumbnailUrl: "",
        duration: "Unknown",
        getStreams: () => ({
          both: url
        })
      }
    else return false
  } catch (e) {
    return false
  }
}
