var Parser = require('dataobject-parser')
  , fs = require('fs-extra')
  , _ = require('underscore')
  , path = require('path')

var config = new Parser()

 module.exports = function (configFile) {
   if (configFile)
     try {
       _.map(fs.readJsonSync(configFile), function (value, key) {
         config.set(key, value)
       })
     }
     catch (e) {
       console.error(e)
     }
   return config
 }
