var request = require('request')
  , _ = require('underscore')

console.log('client for node')

var Client = function (opt) {
  if (opt.jar) this.jar = opt.jar
  console.log(opt.jar)
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

Client.prototype.getBoardsOffline = function (cb) {
  var boards = require('./data/boards')
  if (_.isFunction(cb)) cb(null, boards)
}

Client.prototype.findHex = function (opt, cb) {
  var reqParam = {
    url: this.url('findHex')
  , json: true
  , qs: opt
  }
  if (this.jar) reqParam.jar = this.jar
  request.get(reqParam, function (e, r, body) {
    if (_.isFunction(cb)) cb(body)
  })
}

Client.prototype.getHex = function (opt, cb) {
  var self = this
  this.findHex(opt, function (hexExist) {
    console.log(hexExist)
    if (hexExist === 'yes') {
      var reqParam = {
        url: self.url('getHex') + '/' + opt.name + '.hex'
      , qs: opt
      }
      if (self.jar) reqParam.jar = self.jar
      console.log(reqParam.jar)
      request.get(reqParam, function (e, r, body) {
        console.log(body)
      })
    }
  })
}

module.exports = Client
