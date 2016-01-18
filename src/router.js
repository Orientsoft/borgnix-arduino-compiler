var router = require('express').Router()
  , ArduinoCompiler = require('./make')
  , ProjectManager = require('borgnix-project-manager/lib/project-manager')
  , path = require('path')
  // , boards = require('./lib/board')
  , fs = require('fs-extra')
  , walk = require('walk')
  , unzip = require('unzip')
  , _ = require('underscore')

var compiler, pm, boards = require('../data/boards.json')

router.post('/compile', async function(req, res) {
  // console.log(req.body)
  var info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    var sketch = await pm.findProject(info)
    compiler.compile(sketch, req.body.board, function(err, stdout, stderr) {
      var memoryUsage = stdout.slice(stdout.lastIndexOf('AVR Memory Usage'))
      res.json({
        status: err ? 1 : 0
      , content: {
          error: err
        , stdout: memoryUsage
        , stderr: stderr
        }
      })
    })
  } catch (e) {
    res.json({status: 1, content: e.toString()})
  }
})

router.get('/boards', function(req, res) {
  // res.json(Object.keys(boards.data()))
  res.json(boards)
})

router.get('/hex/:filename', async function(req, res) {
  var info = {
    owner: req.session.user.uid
  , type: req.body.type
  , name: req.body.name
  }
  try {
    var sketch = await pm.findProject(info)
      , hexFile = path.join(
          sketch.dir
        , 'build-' + (req.query.board || 'uno')
        , req.params.filename
        )
    if (fs.existsSync(hexFile)) {
      res.sendFile(hexFile)
    } else {
      res.json({status: 1, content: 'Hex Not Found'})
    }
  } catch (e) {
    res.json({status: 1, content: 'Hex Not Found'})
  }
})

router.post('/upload-zip-lib', function(req, res) {
  _.map(req.files, function(file, key) {
    // console.log(file)
    if (file.extension !== 'zip') return null
    var outPath = path.join(
      pm.projectDir, req.session.user.uid
    , 'arduino/libraries'
    , path.basename(file.originalname, '.zip')
    )
    fs.createReadStream(file.path).pipe(unzip.Extract({
      path: outPath
    }))
  })
  res.json({
    status: 0
  })
})

router.get('/libs', function(req, res) {
  var userLibPath = path.join( pm.projectDir, req.session.user.uid
                             , 'arduino/libraries')
  compiler.initLibs(path.join(userLibPath, '..'))
  console.log(userLibPath)
  var ideLibPath = path.join(compiler.arduinoDir, 'libraries')
  console.log(ideLibPath)
  var avrLibPath = path.join( compiler.arduinoDir
                            , 'hardware/arduino/avr/libraries')
  console.log(avrLibPath)

  try {
    var userLibs = getLibs(userLibPath, 'user')
    var ideLibs = getLibs(ideLibPath, 'ide')
    var avrLibs = getLibs(avrLibPath, 'ide')
    res.json({
      status: 0,
      content: {
        userLibs: userLibs,
        ideLibs: ideLibs.concat(avrLibs)
      }
    })
  } catch (e) {
    res.json({
      status: 1,
      content: e
    })
  }
})

function getLibs(libPath, type) {

  var libs = []
  fs.readdirSync(libPath).map(function(file) {
    var fullPath = path.join(libPath, file)
    var stat = fs.lstatSync(fullPath)

    var lib = {
      name: file,
      headers: []
    }
    if (type === 'ide') {
      lib.type = 'ide'
    } else if (stat.isSymbolicLink()) {
      lib.type = 'public'
    } else if (stat.isDirectory()) {
      lib.type = 'private'
    } else {
      return null
    }

    var opt = {
      followLinks: true,
      listeners: {
        file: function(root, stat, next) {
          // console.log(path.extname(stat.name), root)
          if (path.relative(fullPath, root).indexOf('example') != -1)
            return next()
          if (path.extname(stat.name) === '.h') {
            var header = path.join(path.relative(fullPath, root), stat.name)
            if (header.indexOf('src/') === 0)
              header = header.slice(4)
            if (header.indexOf('extras/') === 0)
              return next()
            lib.headers.push(header)
          }
          next()
        },
        error: function() {
          console.error('walking error')
          throw new Error('walking error')
        },
        end: function() {
          libs.push(lib)
        }
      }
    }
    var walker = walk.walkSync(fullPath, opt)

  })
  return libs
}

module.exports = function(config) {
  var opt = {}
  if (config.projectRoot)
    opt.root = config.projectRoot
  else
    throw new Error('config.projectRoot is missing')

  if (config.arduinoLibs)
    opt.arduinoLibs = config.arduinoLibs
  else
    throw new Error('config.arduinoLibs is missing')

  pm = new ProjectManager({
    projectDir: config.projectRoot
  , tplDir: path.join(__dirname, '../project-tpl')
  , store: config.store
  })

  compiler = new ArduinoCompiler(config)

  return router
}
