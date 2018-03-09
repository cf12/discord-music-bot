const fs = require('fs')
const path = require('path')
const paths = require('../paths')

module.exports = () => {
  return {
    config: JSON.parse(fs.readFileSync(path.join(paths.CONFIG, 'config.json')))
  }
}
