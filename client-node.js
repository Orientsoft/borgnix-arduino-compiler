var request = require('request')
  , _ = require('underscore')

var Client = function (opt) {
  this.host = opt.host || ''
  this.prefix = opt.prefix || ''
  this.endpoints = {
    compile: '/compile'
  , listLibs: '/libs'
  , uploadZipLib: '/upload-zip-lib'
  , getHex: '/hex'
  , findHex: '/findhex'
  , getBoards: '/boards'
  }
}

Client.prototype.url = function (endpoint) {
  return this.host + this.prefix + this.endpoints[endpoint]
}

Client.prototype.getBoards = function (cb) {
  request.get(this.url('getBoards'), function (e, r, b) {
    if (e) console.log(e)
    if (_.isFunction(cb)) cb(e, b)
  })
}

module.exports = Client
