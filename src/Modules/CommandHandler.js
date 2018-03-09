const fs = require('fs')
const path = require('path')

const paths = require('../paths')

class CommandHandler {
  constructor () {
    this.commands = []

    this._loadCommands(paths.COMMANDS)
  }

  _loadCommands (dir) {
    fs.readdirSync(dir)
      .filter((e) => !e.startsWith('_'))
      .map((e) => {
        const itemPath = path.join(dir, e)

        if (fs.statSync(itemPath).isDirectory()) this._loadCommands(itemPath)
        else this.commands.push(require(itemPath))
      })
  }

  getCommand (query) {
    return this.commands.filter(e => e.info.command === query)[0]
  }

  getCommands () {
    return this.commands
  }
}

module.exports = CommandHandler
