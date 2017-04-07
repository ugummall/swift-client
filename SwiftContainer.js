
const Promise = require('any-promise');
const request = require('request');
const requestp = require('request-promise');
const SwiftEntity = require('./SwiftEntity');
const util = require('util');


module.exports = SwiftContainer;


function SwiftContainer(containerName, authenticator) {
  SwiftEntity.call(this, 'Object', containerName, authenticator);
}

util.inherits(SwiftContainer, SwiftEntity);


SwiftContainer.prototype.create = function (name, stream, meta, extra) {
  var _this = this;

  return _this.authenticator.authenticate().then(function(auth){
    return new Promise(function (resolve, reject) {
      var req = request({
          method: 'PUT',
          uri: auth.url + _this.urlSuffix + '/' + name,
          headers: _this.headers(meta, extra, auth.token)
        })
        .on('error', function (err) {
          reject(err);
        })
        .on('response', function (response) {
          if (response.statusCode === 201) {
            resolve();
          } else {
            reject(new Error('HTTP ' + response.statusCode));
          }
        });

      stream.pipe(req);
    });
  });
};


SwiftContainer.prototype.delete = function (name, when) {
  var _this = this;

  if (when) {
    var h = {};

    if (when instanceof Date) {
      h['X-Delete-At'] = +when / 1000;
    } else if (typeof when === 'number' || when instanceof Number) {
      h['X-Delete-After'] = when;
    } else {
      throw new Error('expected when to be a number of seconds or a date');
    }

    return _this.authenticator.authenticate().then(function(auth){
      return requestp({
          method: 'POST',
          uri: auth.url + _this.urlSuffix + '/' + name,
          headers: this.headers(null, h, auth.token)
        });
    });

  } else {
    return SwiftEntity.prototype.delete.call(this, name);
  }
};


SwiftContainer.prototype.get = function (name, stream) {
  var _this = this;

  return _this.authenticator.authenticate().then(function(auth){
    return new Promise(function (resolve, reject) {
      request({
          method: 'GET',
          uri: auth.url + _this.urlSuffix + '/' + name,
          headers: {
            'x-auth-token': auth.token
          }
        })
        .on('error', function (err) {
          reject(err);
        })
        .on('end', function () {
          resolve();
        })
        .pipe(stream);
    });
  });
};
