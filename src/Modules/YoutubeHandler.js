const needle = require('needle')

const base = 'https://www.googleapis.com/youtube/v3'

class YoutubeHandler {
  constructor (apiKey) {
    this.apiKey = apiKey
  }

  async search (query, maxRequests) {
    return new Promise((resolve, reject) => {
      needle('GET', `${base}/search`, {
        q: query,
        maxResults: maxRequests,
        type: 'video,playlist',
        part: 'snippet',
        key: this.apiKey
      })
        .then(res => {
          if (res.body.pageInfo.totalResults === 0)
            reject(new Error('EMPTY_RES'))

          resolve(res.body)
        })
        .catch(reject)
    })
  }

  async getVideo (videoID) {
    try {
      const res = await needle('GET', `${base}/videos`, {
        part: 'snippet,contentDetails',
        id: videoID,
        key: this.apiKey
      })

      console.log(res.body)

      if (res.body.items.length === 0)
        throw new Error('EMPTY_VID')

      return res.body.items[0]
    } catch (err) { throw err }
  }

  async getPlaylist (playlistID) {
    let data = []
    let nextToken = null

    do {
      try {
        const res = await needle('GET', `${base}/playlistItems`, {
          part: 'snippet',
          maxResults: 50,
          playlistId: playlistID,
          key: this.apiKey,
          pageToken: nextToken || null
        })

        console.log(res.body)

        if (!res.body.items.length)
          return

        // Filters out deleted videos by checking if thumbnails exist
        data.push(...res.body.items.map(e => {
          if ('thumbnails' in e.snippet)
            return e.snippet.resourceId.videoId
        }))

        nextToken = res.body.nextPageToken || null
      } catch (err) { throw err }
    } while (nextToken)

    if (data.length)
      return data
    else throw new Error('EMPTY_PLAYLIST')
  }
}

module.exports = YoutubeHandler
