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