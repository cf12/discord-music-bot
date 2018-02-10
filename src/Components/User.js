class User {
  constructor (id) {
    this.id = id
    this.history = {
      nicknameChange: 0
    }
  }
}

module.exports = User
