class SiteManager {
  constructor(videoConfig) {
    this.videoConfig = videoConfig
    this.sites = [
      require("./youtube"),
      require("./youtubePlaylist"),
      require("./rawURL"),
      require("./youtubeDl"),
      require("./ytSearch"),
    ]
  }

  async getVideo(url) {
    for (const site of this.sites) {
      const res = await site.getVideo(url, this.videoConfig)
      if (res) return res
    }
    return false
  }
}

module.exports = SiteManager
