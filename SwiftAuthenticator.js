"use strict";

const requestp = require('request-promise');

/**
 * This module is designed to do a lazy authentication
 */
class SwiftAuthenticator {
    constructor(authUrl, username, password) {
        // Values used for initial authentication
        this.authUrl = authUrl;
        this.username = username;
        this.password = password;

        // Values used after authentication
        this.authenticated = false;
        this.url = null;
        this.token = null;
    }

    authenticate(cb) {
        if (this.authenticated) {
            return new Promise(resolve => {
                resolve({ url: this.url, token: this.token });
            });
        } else {
            return requestp({
                method: 'GET',
                uri: this.authUrl,
                headers: {
                    'x-auth-user': this.username,
                    'x-auth-key': this.password
                },
                resolveWithFullResponse: true
            }).then(response => {
                this.url = response.headers['x-storage-url'];
                this.token = response.headers['x-auth-token'];
                this.authenticated = true;
                return { url: this.url, token: this.token };
            });
        }
    }
}

module.exports = SwiftAuthenticator;