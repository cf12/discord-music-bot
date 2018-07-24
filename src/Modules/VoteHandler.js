class VoteHandler {
  constructor () {
    this.votes = []
  }

  voterExists (id) {
    return this.votes.includes(id)
  }

  addVoter (id) {
    this.votes.push(id)
  }

  reset () {
    this.votes = []
  }

  getSize () {
    return this.votes.length
  }

  updateVoters (source) {
    let res = []

    for (const id of this.votes) {
      if (source.includes(id)) res.push(id)
    }

    this.votes = res
    return res.length
  }

  getResults (source, total) {
    const votes = this.updateVoters(source)

    if (votes >= Math.floor(total * 0.75)) return ['PASSING', votes]
    else return ['FAILED', votes]
  }
}

module.exports = VoteHandler
