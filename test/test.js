var request = require('request')
  , minimist = require('minimist')
  , boards = require('../lib/board.js')

var argv = minimist(process.argv.slice(2))

var action = argv._[0]

switch (action) {
  case 'compile':
    var opt = {
      url: 'http://127.0.0.1:3000/c/compile'
    , body: {
        uuid: 'uuid'
      , token: 'token'
      , type: 'arduino'
      , name: 'test'
      , board: 'uno'
      }
    , json: true
    }
    request.post( opt, function (err, res, body) {
      if (err) return console.error(err)
      var memoryUsage = body.content.stdout.split('AVR Memory Usage')[1]
        , stderr = body.content.stderr

      if (memoryUsage) console.log(memoryUsage)
      else console.log(stderr)
    })
    break
  case 'boards':
    request.get('http://127.0.0.1:3000/c/boards', function (e, r, body) {
      console.log(body)
    })
    break
  default:

}
