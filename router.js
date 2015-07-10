var router = require('express').Router()
  , ArduinoCompiler = require('./make')
  , BPM = require('borgnix-project-manager')
  , path = require('path')
  , boards = require('./lib/board')
  , fs = require('fs-extra')

var compiler = new ArduinoCompiler()
  , bpm

compiler.arduinoDir = '/Applications/Arduino.app/Contents/Java'
compiler.arduinoMkDir = '/usr/local/Cellar/arduino-mk/1.5'
compiler.makefile = compiler.arduinoMkDir + '/Arduino.mk'
compiler.tplFile = path.join(__dirname, 'data', 'makefile.template')

router.post('/compile', function (req, res) {
  console.log(req.body)
  var sketch = bpm.findProject(req.body.uuid, req.body.type, req.body.name)
  console.log(sketch)
  if (!sketch)
    return res.json({status: 1, content: 'sketch not found'})
  compiler.compile(sketch, req.body.board, function (err, stdout, stderr) {
    var memoryUsage = stdout.slice(stdout.lastIndexOf('AVR Memory Usage'))
    res.json({ status: err ? 1 : 0
             , content: { error: err
                        , stdout: memoryUsage
                        , stderr: stderr}})
  })
})

router.get('/boards', function (req, res) {
  res.json(Object.keys(boards.data()))
})

router.get('/hex/:filename', function (req, res) {
  var sketch = bpm.findProject(req.query.uuid, req.query.type, req.query.name)
    , hexFile = path.join(sketch.dir, 'build-'+(req.query.board || 'uno'), req.params.filename)
  if (fs.existsSync(hexFile)) {
    // res.json('yes')
    res.sendFile(hexFile)
  }
  else {
    res.json('no')
  }
})

router.get('/findhex', function (req, res) {
  var sketch = bpm.findProject(req.query.uuid, req.query.type, req.query.name)
    , hexFile = path.join(sketch.dir, 'build-'+(req.query.board || 'uno'), sketch.name+'.hex')
  if (fs.existsSync(hexFile)) {
    res.json('yes')
  }
  else {
    res.json('no')
  }
})

module.exports = function (root) {
  bpm = new BPM(root)
  return router
}
