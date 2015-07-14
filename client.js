import $ from 'jquery'
import _ from 'underscore'

var Client = function (opt) {
  this.host = opt.host || ''
  this.prefix = opt.prefix || ''
  this.endpoints = {
    compile: '/compile'
  , listLibs: '/libs'
  , uploadZipLib: '/upload-zip-lib'
  , getHex: '/hex'
  , findHex: '/findhex'
  }
}

Client.prototype.url = function (endpoint) {
  return this.host + this.prefix + this.endpoints[endpoint]
}

Client.prototype.listLibs = function (uuid, cb) {
  $.ajax({
    url: this.url('listLibs')
  , method: 'GET'
  , data: {
      uuid: uuid
    }
  , success: cb
  })
}

Client.prototype.compile = function (opt, cb) {
  $.ajax({
    url: this.url('compile')
  , method: 'POST'
  , data: opt
  , success: cb
  })
}

Client.prototype.uploadZipLib = function (opt, cb) {
  $.ajax({
      url: this.url('uploadZipLib')+'?'+$.param({ uuid: opt.uuid
                                                , token: opt.token}),
      type: 'POST',
      data: opt.data,
      cache: false,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: cb,
      error: function(jqXHR, textStatus, errorThrown){
        console.log('ERRORS: ' + textStatus)
      }
  })
}

Client.prototype.findHex = function (opt, cb) {
  var self = this
  $.ajax({
    url: self.url('findHex')
  , method: 'GET'
  , data: opt
  , success: function (data) {
      var send = {}
      if (data === 'yes') {
        send.status = 0
        send.url = self.url('getHex') + '/' + opt.name + '.hex?' + $.param(opt)
      }
      else {
        send.status = 1
      }
      if (_.isFunction(cb)) cb(send)
    }
  })
}

Client.prototype.method = function (uuid) {

}

export default Client
