const ytdl = require('ytdl-core')
const ytpl = require('ytpl')

exports.getVideo = (url) => {
  return {
    title: "",
    description: "",
    author: "",
    thumbnailUrl: "",
    duration: "",
    getStreams: () => ({
      audio: {},
      video: {},
      both: false
    })
  }
}