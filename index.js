"use strict";

const requestp = require('request-promise');
const SwiftContainer = require('./SwiftContainer');
const SwiftEntity = require('./SwiftEntity');
const SwiftAuthenticator = require('./SwiftAuthenticator');

class SwiftClient extends SwiftEntity {
    constructor(url, username, password) {
        super('Container', null, new SwiftAuthenticator(url, username, password));
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

    container(name) {
        return new SwiftContainer(name, this.authenticator);
    }
}

module.exports = SwiftClient;