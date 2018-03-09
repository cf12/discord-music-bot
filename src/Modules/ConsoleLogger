const chalk = require('chalk')
const timestamp = require('time-stamp')

class Logger {
  constructor () {

  }

  _getTimestamp () {
    return timestamp('[YYYY:MM:DD-HH:mm:ss]')
  }

  info (msg) {
    console.log(`${chalk.green(this._getTimestamp())} ${chalk.blue('[INFO] >')} ${chalk.yellow(msg)}`)
  }

  error (msg) {
    console.log(`${chalk.green(this._getTimestamp())} ${chalk.red('[ERROR] >')} ${chalk.yellow(msg)}`)
  }
}

module.exports = Logger
