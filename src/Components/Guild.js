const User = require('./User')

class Guild {
  constructor (id) {
    this.id = id
    this.users = {}
    this.timers = {}
  }

  addUser (id) {
    this.users[id] = new User(id)
    return this.users[id]
  }

  getUser (id) {
    return (this.users[id])
      ? this.users[id]
      : this.addUser(id)
  }
}

module.exports = Guild
