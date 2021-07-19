"use strict";

const requestp = require('request-promise').defaults({ jar: true });
const queryString = require('query-string');

class SwiftEntity {
    constructor(childName, urlSuffix, authenticator) {
        console.log('UKR-DEBUG: You are using UKR version...');
        this.childName = childName;
        this.urlSuffix = urlSuffix ? `/${urlSuffix}` : '';
        this.authenticator = authenticator;
        //console.log("UKR-DEBUG: List authenticator");
        //console.log(authenticator);
    }

    list(extra, query) {
        // UKR: shifting to method headers. Better use headers
        const querystring = query ? '?' + queryString.stringify(query) : '';
        return this.authenticator.authenticate().then(auth => requestp({
            uri: auth.url + this.urlSuffix + querystring,
            headers: this.headers(null, extra, auth.token, auth.efsrcookie),
            json: true
        }))
        ;
    }

    update(name, meta, extra) {
        return this.authenticator.authenticate().then(auth => requestp({
            method: 'POST',
            uri: `${auth.url + this.urlSuffix}/${name}`,
            headers: this.headers(meta, extra, auth.token, auth.efsrcookie)
        }));
    }

    meta(name) {
        return this.authenticator.authenticate().then(auth => requestp({
            method: 'HEAD',
            uri: `${auth.url + this.urlSuffix}/${name}`,
            headers: this.headers(null, null, auth.token, auth.efsrcookie),
            resolveWithFullResponse: true
        }).then(response => {
            const meta = {};
            const headers = response.headers;
            const regex = new RegExp(`^X-${this.childName}-Meta-(.*)$`, 'i');

            for (const k in headers) {
                const m = k.match(regex);

                if (m) {
                    meta[m[1]] = headers[k];
                }
            }

            return meta;
        }));
    }

    delete(name) {
        return this.authenticator.authenticate().then(auth => requestp({
            method: 'DELETE',
            uri: `${auth.url + this.urlSuffix}/${name}`,
            headers: this.headers(null, null, auth.token, auth.efsrcookie)
        }));
    }

    headers(meta, extra, token, efsrcookie) {
        const headers = Object.assign({
            'accept': 'application/json',
            'x-auth-token': token,
            'cookie' : efsrcookie
        }, extra);

        console.log('UKR-DEBUG: Seting headers started');
        //console.log(meta);
        //console.log(extra);
        //console.log(token);
        console.log('UKR-DEBUG: Seting headers ended');

        if (meta != null) {
            for (const k in meta) {
                if (meta.hasOwnProperty(k)) {
                    headers[`X-${this.childName}-Meta-${k}`] = meta[k];
                }
            }
        }

        return headers;
    }
}

module.exports = SwiftEntity;
