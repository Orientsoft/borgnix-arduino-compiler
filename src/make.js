'use strict'

var fs = require('fs-extra')
  , path = require('path')
  , format = require('string-template')
  , butil = require('./util')

class ArduinoCompiler {
  constructor(config) {
    var reqs = ['arduinoDir', 'arduinoMkDir', 'arduinoLibs']
    for (var req of reqs) {
      if (!config[req])
        throw new Error(`config.${req} is required`)
      this[req] = config[req]
    }

    this.makefile = path.join(this.arduinoMkDir, 'Arduino.mk')
    this.tplFile = path.join(__dirname, '../data/makefile.template')
  }

  initLibs(sketchbook, cb) {
    var libDir = path.join(sketchbook, 'libraries')
    if (fs.existsSync(libDir)) return null

    fs.mkdirpSync(libDir)
    for (var lib of fs.readdirSync(this.arduinoLibs))
      fs.symlinkSync(path.join(libDir, lib), path.join(this.arduinoLibs, lib))
    butil.call(cb)
  }

  compile(sketch, board, cb) {
    var tpl = fs.readFileSync(this.tplFile).toString()
    fs.writeFileSync(
      path.join(sketch.dir, 'makefile')
    , format(tpl, {
        board: board
      , arduinoMkDir: this.arduinoMkDir
      , arduinoDir: this.arduinoDir
      , arduinoMakefile: this.makefile
      // , libs: sketch.libs ? sketch.libs.join(' ') : ''
      , sketchbook: path.join(sketch.dir, '..')
      })
    )
    butil.exec(['make'], {cwd: sketch.dir}, cb)
  }
}

module.exports = ArduinoCompiler
