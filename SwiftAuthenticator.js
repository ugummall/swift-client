const requestp = require('request-promise');

module.exports = SwiftAuthenticator;

/**
 * This module is designed to do a lazy authentication
 */
function SwiftAuthenticator(authUrl, username, password) {
  // Values used for initial authentication
  this.authUrl = authUrl;
  this.username = username;
  this.password = password;
  
  // Values used after authentication
  this.authenticated = false;
  this.url = null;
  this.token = null;
}

SwiftAuthenticator.prototype.authenticate = function(cb) {
    var _this = this;
    
    if(authenticated) {
      return new Promise(function(resolve) {
        resolve({url: _this.url, token: _this.token});
      });
    } else {
      return requestp({
        method: 'POST',
        uri: url,
        headers: {
          'x-auth-user': username,
          'x-auth-key': password
        },
        resolveWithFullResponse: true
      })
      .then(function (response) {
        _this.url = response.headers['x-storage-url'];
        _this.token = response.headers['x-auth-token'];
        _this.authenticated = true;
        return {url: _this.url, token: _this.token};
      });
    }
}
