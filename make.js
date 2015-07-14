var fs = require('fs-extra')
  , path = require('path')
  , format = require('string-template')
  , butil = require('./lib/util')

function ArduinoCompiler (config) {
  if (config.arduinoDir)
    this.arduinoDir = config.arduinoDir
  else
    throw new Error('config.arduinoDir is missing')

  if (config.arduinoMkDir)
    this.arduinoMkDir = config.arduinoMkDir
  else
    throw new Error('config.arduinoMkDir is missing')

  this.makefile = this.arduinoMkDir + '/Arduino.mk'
  this.tplFile = path.join(__dirname, 'data', 'makefile.template')
}

ArduinoCompiler.prototype.compile = function (sketch, board, cb) {
  var tpl = fs.readFileSync(this.tplFile).toString()
  fs.writeFileSync( path.join(sketch.dir, 'makefile')
                  , format(tpl, { board: board
                                , arduinoMkDir: this.arduinoMkDir
                                , arduinoDir: this.arduinoDir
                                , arduinoMakefile: this.makefile
                                // , libs: sketch.libs ? sketch.libs.join(' ') : ''
                                , sketchbook: path.join(sketch.dir, '..')
                                }))
  var cmd = ['make']
  butil.exec(cmd, {cwd: sketch.dir}, cb)
}

module.exports = ArduinoCompiler
