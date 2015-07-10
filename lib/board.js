var fs = require('fs')
  , path = require('path')
  , Parser = require('dataobject-parser')
  , config = require('./config')(path.join(__dirname, '..', 'data/config.json'))
  , _ = require('underscore')

var boards = new Parser()

fs.readFileSync(path.join( config.get('arduino_dir')
                         , 'hardware/arduino/avr/boards.txt')
   )
  .toString()
  .split('\n')
  .filter(function (line) {
     if (line === '' || line[0] === '#') return false
     else return true
   })
  .map(function (line) {
     var temp = line.split('=')
     boards.set(temp[0], temp[1])
   })

module.exports = boards
