var ALM = require('./library')
  , boards = require('./board')
  , Platform = require('./platform')
  , path = require('path')

// ALM.scanLibs('/Users/eddie/Documents/Arduino/libraries')
// console.log(boards.listBoards())
var platform = Platform(boards.getBoard('uno'))

// console.log(platform.getCorePath())
// console.log(platform.getVariantPath())
// console.log(platform.getStandardLibPath())
// console.log(platform.getAvrLibPath())
// console.log(platform.getUserLibPath())
// console.log(platform.getCompilerBinaryPath())

var BSM = require('./sketch')

// console.log(new bsm('sketch').Sketch)
var bsm = new BSM(path.join(__dirname, 'sketch'))
// console.log(bsm.Sketch)
var sketch = bsm.findProject('uuid', 'arduino', 'test')
sketch.libs = ['espduino', 'MemoryFree', 'SoftwareSerial', 'Time']
// console.log(sketch)

var ArduinoCompiler = require('./make')

var compiler = new ArduinoCompiler()
compiler.tplFile = path.join(__dirname, 'makefile.template')
compiler.makefile = '/usr/local/Cellar/arduino-mk/1.5/Arduino.mk'

compiler.compile(sketch, 'uno', function (err) {
  if (err) console.error(err)
  console.log('compiling finished')
})

// var sketch = new Sketch()
