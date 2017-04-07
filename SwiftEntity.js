
const requestp = require('request-promise');


module.exports = SwiftEntity;


function SwiftEntity(childName, authenticator) {
  this.childName = childName;
  this.authenticator = authenticator;
}


SwiftEntity.prototype.list = function () {
  var _this = this;

  _this.authenticator.authenticate().then(function(auth){
      return requestp({
      uri: auth.url,
      headers: _this.headers(null, null, auth.token),
      json: true
    });
  });
};


SwiftEntity.prototype.update = function (name, meta, extra) {
  var _this = this;

  _this.authenticator.authenticate().then(function(auth){
    return requestp({
        method: 'POST',
        uri: auth.url + '/' + name,
        headers: _this.headers(meta, extra, auth.token)
      });
  });
};


SwiftEntity.prototype.meta = function (name) {
  var _this = this;

  _this.authenticator.authenticate().then(function(auth){
      return requestp({
        method: 'HEAD',
        uri: auth.url + '/' + name,
        headers: _this.headers(null, null, auth.token),
        resolveWithFullResponse: true
      })
      .then(function (response) {
        var meta = {};
        var headers = response.headers;
        var regex = new RegExp('^X-' + _this.childName + '-Meta-(.*)$', 'i');

        for (var k in headers) {
          var m = k.match(regex);

          if (m) {
            meta[m[1]] = headers[k];
          }
        }

        return meta;
      });
  });
};


SwiftEntity.prototype.delete = function (name) {
  var _this = this;

  _this.authenticator.authenticate().then(function(auth){
    return requestp({
      method: 'DELETE',
      uri: auth.url + '/' + name,
      headers: _this.headers(null, null, auth.token)
    });
  });
};


SwiftEntity.prototype.headers = function (meta, extra, token) {
  var headers = Object.assign({
    'accept': 'application/json',
    'x-auth-token': token
  }, extra);

  if (meta != null) {
    for (var k in meta) {
      if (meta.hasOwnProperty(k)) {
        headers['X-' + this.childName + '-Meta-' + k] = meta[k];
      }
    }
  }

  return headers;
};
