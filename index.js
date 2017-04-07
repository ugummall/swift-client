
const requestp = require('request-promise');
const SwiftContainer = require('./SwiftContainer');
const SwiftEntity = require('./SwiftEntity');
const SwiftAuthenticator = require('./SwiftAuthenticator');
const util = require('util');

module.exports = SwiftClient;

function SwiftClient(url, username, password) {
  SwiftEntity.call(this, 'Container', new SwiftAuthenticator(url, username, password));
}

util.inherits(SwiftClient, SwiftEntity);


SwiftClient.prototype.create = function (name, publicRead, meta, extra) {
  var _this = this;

  if (typeof publicRead === 'undefined') {
    publicRead = false;
  }

  if (publicRead) {
    if (!extra)
      extra = {};
    
    extra['x-container-read'] = '.r:*';
  }

  _this.authenticator.authenticate().then(function(auth) {
    return requestp({
      method: 'PUT',
      uri: auth.url + '/' + name,
      headers: _this.headers(meta, extra, auth.token)
    });
  });
};


SwiftClient.prototype.container = function (name) {
  return new SwiftContainer(this.authenticator);
};
