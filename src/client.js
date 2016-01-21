'use strict'

import promisify from 'es6-promisify'
import mqtt from 'mqtt'
import stk500 from 'stk500'
import intelHex from 'intel-hex'
import _ from 'lodash'
import $ from 'jquery'

var board = 'uno'
  , name = 't2'

const MQTT_BROKER = 'ws://z.borgnix.com:1883'
const AT_CMD = {
  GPIO_0: '+++AT GPIO 0'
, GPIO_1: '+++AT GPIO 1'
, PING: '+++AT PING'
}

var hexOpts = {
  name: name
, board: board
, type: 'arduino'
}

var topicOut = '/devices/UUID/out'
  , topicIn = '/devices/UUID/in'

let sleep = function (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

let reset = async function (sp) {
  let t = 1000
  sp.write(AT_CMD.GPIO_1)
  await sleep(t)
  sp.write(AT_CMD.GPIO_0)
  await sleep(t)
  sp.write(AT_CMD.GPIO_1)

}

let _client, _msp

// let getMqttSerial = async function () {
  // if (_msp) {
  //   console.log('direct')
  //   return _msp
  // }
  //
  // if (!_client)
  //   _client = mqtt.connect('mqtt://voyager.orientsoft.cn:11883', {
  //     qos: 1
  //   })
  //
  // await new Promise(function (resolve, reject) {
  //   _client.once('connect', resolve)
  //   _client.once('error', reject)
  // })
  //
  // _msp = new SerialPort({
  //   client: _client
  // , transmitTopic: topicOut
  // , receiveTopic: topicIn
  // })
  //
  // return _msp
// }

let pingESP = async function (sp) {
  sp.write(AT_CMD.PING)
  await new Promise(function (resolve, reject) {
    sp.once('data', (data) => {
      if (data.toString() === 'ESP PING_RSP\r\n') {
        console.log('yes')
        resolve()
      }
      else {
        console.log('no', data.toString())
        reject()
      }
    })
  })
}

let bootload = promisify(stk500.bootload.bind(stk500))

let uploadHex = async function (msp, hexFile, board) {
  let hex = intelHex.parse(hexFile).data
  let uno = require('../data/boards').uno
  let param = {
    name: 'uno'
  , baud: parseInt(uno.upload.speed)
  , signature: new Buffer(uno.signature, 'hex')
  , pageSize: 128
  , timeout: 2000
  }
  await pingESP(msp)
  console.log('PONG')
  await reset(msp)
  console.log('RESETED')
  await bootload(msp, hex, param)
  console.log('UPLOAD FINISH')
}

const endpoints = {
  compile: '/compile'
, listLibs: '/libs'
, uploadZipLib: '/upload-zip-lib'
, getHex: '/hex'
, findHex: '/findhex'
, getBoards: '/boards'
, uploadHex: '/uploadHex'
}

export default class Client {
  constructor(opts) {
    this.host = opts.host || ''
    this.prefix = opts.prefix || ''
  }

  _url(action) {
    return this.host + this.prefix + endpoints[action]
  }

  _jsonReq(method, name, opts) {
    return $.ajax({
      url: this._url(name)
    , method: method
    , data: JSON.stringify(opts)
    , contentType: 'application/json'
    })
  }

  compile(opts) {
    console.log('src.compile')
    this._jsonReq('POST', 'compile', opts)
  }

  listLibs(opts, callback) {
    return $.get({
      url: this._url('listLibs')
    , data: opts
    }).done(callback)
  }

  getBoards(opts) {

  }

  uploadZipLib(opts) {
    return $.ajax({
      url: this._url('uploadZipLib'),
      type: 'POST',
      data: opts.data,
      cache: false,
      dataType: 'json',
      processData: false,
      contentType: false,
      // success: cb,
      error: (jqXHR, textStatus, errorThrown) => {
        console.log('ERRORS: ' + textStatus)
      }
    })
  }

  uploadHex(opts) {
    return uploadHex(opts.port, opts.hex, opts.board)
  }
}
