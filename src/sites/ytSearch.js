const ytsr = require('ytsr')
const youtube = require('./youtube')

exports.getVideo = async (query, videoConfig, nextPageRef = "") => {
  const searchRes = await ytsr(query, {
    limit: videoConfig.searchLimit,
    ...(nextPageRef ? {nextPageRef} : {})
  })

  const results = await Promise.all(searchRes.items.filter(i => i.type === "video").map(async v => ({
    video: await youtube.getVideo(v.link, videoConfig),
    title: v.title
  })))

  return {
    type: "search",
    query,
    results,
    nextPage: searchRes.nextpageRef ? () => {
      return exports.getVideo(query, videoConfig, searchRes.nextpageRef)
    } : false
  }
}