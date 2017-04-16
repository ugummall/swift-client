"use strict";

const URL = require('url-parse');
const requestp = require('request-promise');
const SwiftContainer = require('./SwiftContainer');
const SwiftEntity = require('./SwiftEntity');
const SwiftAuthenticator = require('./SwiftAuthenticator');

class SwiftClient extends SwiftEntity {
    constructor(url, username, password) {
        super('Container', null, new SwiftAuthenticator(url, username, password));
        this.infoUrl = (new URL(url)).origin + "/info";
    }

    create(name, publicRead, meta, extra) {
        if (typeof publicRead === 'undefined') {
            publicRead = false;
        }

        if (publicRead) {
            if (!extra)
                extra = {};

            extra['x-container-read'] = '.r:*';
        }

        return this.authenticator.authenticate().then(auth => requestp({
            method: 'PUT',
            uri: `${auth.url}/${name}`,
            headers: this.headers(meta, extra, auth.token)
        }));
    }

    /**
     * Gets cluster configuration parameters
     * @returns {Promise.<Object>}
     */
    info() {
        return requestp({
            method: 'GET',
            uri: this.infoUrl,
            json: true
        })
    }

    container(name) {
        return new SwiftContainer(name, this.authenticator);
    }
}

module.exports = SwiftClient;