import $ from 'jquery'

var Client = function (opt) {
  this.host = opt.host
  this.prefix = opt.prefix || ''
  this.endpoints = {
    newProject: '/project'
  , deleteProject: '/project'
  , listProject: '/projects'
  , saveFiles: '/project/files'
  , deleteFiles: '/project/files'
  }
}

Client.prototype.listLibs = function (uuid) {
  
}
