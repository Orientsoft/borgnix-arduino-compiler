var _ = require('underscore'),
    child_process = require('child_process');

module.exports.call = function (fn) {
  var args = Array.prototype.slice.call(arguments).slice(1);
  if (_.isFunction(fn)) fn.apply(fn, args);
};

module.exports.exec = function (cmd, opts, cb) {
  child_process.execFile(cmd[0], cmd.slice(1), opts, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    module.exports.call(cb, err, stdout, stderr);
  });
};