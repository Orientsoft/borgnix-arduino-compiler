'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    Parser = require('dataobject-parser'),
    config = require('./lib/config')(path.join(__dirname, '../data/config.json')),
    _ = require('underscore');

var boards = new Parser();

fs.readFileSync(path.join(config.get('arduino_dir'), 'hardware/arduino/avr/boards.txt')).toString().split('\n').filter(function (line) {
  if (line === '' || line[0] === '#') return false;else return true;
}).map(function (line) {
  var temp = line.split('=');
  boards.set(temp[0], temp[1]);
});

var file = fs.readFileSync(path.join(config.get('arduino_dir'), 'hardware/tools/avr/etc/avrdude.conf')).toString();

var lines = file.split('\n');

lines = lines.filter(function (line) {
  if (line.length === 0) return false;
  if (line[0] === '#') return false;
  return true;
});

var d = lines.reduce(function (pv, cv, i) {
  if (cv.search(/desc\s*=/) !== -1) {
    if (lines[i + 1].search(/signature\s*=/) !== -1) {
      var sig = lines[i + 1].split('=')[1].replace(/\"|\;|^\s/g, '').split(' ').map(function (s) {
        return parseInt(s);
      });
      sig = new Buffer(sig);
      var d = {
        chip: cv.split('=')[1].replace(/\"|\;|\s/g, '').toLowerCase(),
        signature: sig
      };
      pv.push(d);
    }
  }
  return pv;
}, []);

var b = boards.data();

_.map(b, function (board, key) {
  if (board.build) {
    if (board.build.mcu) {
      var mcu = board.build.mcu,
          info = _.find(d, function (v) {
        return v.chip === mcu;
      });
      if (info) {
        b[key].signature = info.signature.toString('hex');
      }
    }
  }
});

fs.writeJsonSync('data/boards.json', b, { space: 2 });

console.log(b);