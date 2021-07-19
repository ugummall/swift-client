"use strict";

const EventEmitter = require('events');
const requestp = require('request-promise').defaults({ jar: true });

const AUTH_STATUS = {
    UNAUTHENTICATED: 0,
    AUTHENTICATED: 1,
    FAILED: 2
};

const AUTH_EVENT = 'authentication';

class SwiftAuthenticator extends EventEmitter {
    constructor(authUrl, username, password) {
        super();

        // Authenticated credentials
        let url;
        let token;
        let efsrcookie;     // UKR: introducing my own cookie

        // Authentication process flags
        let authStatus = AUTH_STATUS.UNAUTHENTICATED;
        let authError = null;

        // Starts authStatus process
        requestp({
            method: 'GET',
            uri: authUrl,
            headers: {
                'x-auth-user': username,
                'x-auth-key': password
            },
            resolveWithFullResponse: true
        }).then(response => {
            url = response.headers['x-storage-url'];
            token = response.headers['x-auth-token'];
            console.log('UKR-DEBUG: x-auth-token is: ' + response.headers['x-auth-token']);
            console.log('UKR-DEBUG: x-storage-url is: ' + response.headers['x-storage-url']);
            //console.log(response.headers);
            console.log('UKR-DEBUG: cookie is: ' + response.headers['set-cookie']);
            //efsrcookie = "SWIFT_SERVER_ID=swift01";
            efsrcookie = response.headers['set-cookie'];
            authStatus = AUTH_STATUS.AUTHENTICATED;
            this.emit(AUTH_EVENT);
        }).catch(err => {
            authStatus = AUTH_STATUS.FAILED;
            authError = err;
            this.emit(AUTH_EVENT);
        });

        this._authenticate = function () {
            let returnPromise;
            switch (authStatus) {
                case AUTH_STATUS.UNAUTHENTICATED:
                    returnPromise = new Promise((resolve, reject) => {
                        const authListener = () => {
                            this.removeListener(AUTH_EVENT, authListener);
                            if (authStatus === AUTH_STATUS.AUTHENTICATED) resolve({url: url, token: token, efsrcookie: efsrcookie});
                            if (authStatus === AUTH_STATUS.FAILED) reject(authError);
                        };

                        this.on(AUTH_EVENT, authListener);
                    });
                    break;
                case AUTH_STATUS.AUTHENTICATED:
                    returnPromise = new Promise(resolve => {
                        resolve({url: url, token: token, efsrcookie: efsrcookie});
                    });
                    break;
                case AUTH_STATUS.FAILED:
                    returnPromise = new Promise((resolve, reject) => {
                        reject(authError);
                    });
                    break;
            }

            return returnPromise;
        }
    }

    authenticate() {
        return this._authenticate();
    }
}

module.exports = SwiftAuthenticator;