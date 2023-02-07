const path = require('path')
const fs = require('fs')

const outFile = path.resolve(__dirname, '../dist/preload.js')

const modules = [

  'js/preload/default.js',
  'js/preload/textExtractor.js',
  'js/preload/readerDetector.js',
  'js/preload/siteUnbreak.js',
  'js/preload/passwordFill.js',
  'js/preload/translate.js',
  'server-config.js',
  'js/preload/server.js',
  'js/preload/fav.js',
  'js/preload/webApi.js'
]

function buildPreload() {
  /* concatenate modules */
  let output = ''
  modules.forEach(function (script) {
    output += fs.readFileSync(path.resolve(__dirname, '../', script)) + ';\n'
  })

  fs.writeFileSync(outFile, output, 'utf-8')
}

if (module.parent) {
  module.exports = buildPreload
} else {
  buildPreload()
}
