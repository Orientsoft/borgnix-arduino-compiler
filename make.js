var fs = require('fs-extra')
  , path = require('path')
  , format = require('string-template')
  , butil = require('./lib/util')

function ArduinoCompiler (configFile) {
  try {
    _.extend(this, fs.readJsonSync(configFile))
  }
  catch (e) {
    console.error(e)
  }
}

ArduinoCompiler.prototype.compile = function (sketch, board, cb) {
  var tpl = fs.readFileSync(this.tplFile).toString()
  fs.writeFileSync( path.join(sketch.dir, 'makefile')
                  , format(tpl, { board: board
                                , arduinoMkDir: this.arduinoMkDir
                                , arduinoDir: this.arduinoDir
                                , arduinoMakefile: this.makefile
                                , libs: sketch.libs ? sketch.libs.join(' ') : ''
                                }))
  var cmd = ['make']
  butil.exec(cmd, {cwd: sketch.dir}, cb)
}

module.exports = ArduinoCompiler
