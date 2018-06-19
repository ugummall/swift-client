"use strict";

const expect = require('chai').expect;
const fs = require('fs');
const stream = require('stream');
const SwiftClient = require('../index');

const credentials = require('./credentials.ksv3.json');

describe('SwiftClient', function () {
    this.timeout(4000);

    const client = new SwiftClient(new SwiftClient.KeystoneV3Authenticator(credentials));

    before(() => client.create('swift-client-test'));


    describe('#list', () => {
        it('should get a list of containers', () => client.list()
            .then(containers => {
                expect(containers).to.be.instanceof(Array);

                const container = containers.filter((x) => x.name === 'swift-client-test')[0];
                expect(container).to.exist;
                expect(container.count).to.equal(0);
                expect(container.bytes).to.equal(0);
            }));
    });


    describe('#create', () => {
        it('should create a container', () => client.create('swift-client-test-2')
            .then(() => client.list())
            .then(containers => {
                expect(containers.filter((x) => x.name === 'swift-client-test-2')).to.have.length(1);
                return client.delete('swift-client-test-2');
            }));
    });


    describe('#update', () => {
        it('should update the metadata', () => client.update('swift-client-test', { colour: 'orange' })
            .then(() => client.meta('swift-client-test'))
            .then(meta => {
                expect(meta).to.eql({
                    colour: 'orange'
                });
            }));
    });


    describe('SwiftContainer', () => {
        let container;

        before(() => {
            container = client.container('swift-client-test');

            const s = fs.createReadStream('test/test.txt');
            return container.create('test.txt', s);
        });

        after(() => container.delete('test.txt'));

        describe('#list', () => {
            it('should return a list of objects', () => container.list()
                .then(objects => {
                    expect(objects).to.have.length(1);
                    expect(objects[0].name).to.equal('test.txt');
                }));
        });

        describe('#get', () => {
            it('should get the object', () => {
                const s = new stream.Writable();
                let text = '';

                s._write = chunk => {
                    text += chunk.toString();
                };

                return container.get('test.txt', s)
                    .then(() => {
                        expect(text).to.equal('Hello, world!\n');
                    });
            });
        });

        describe('#update', () => {
            it('should update the metadata', () => container.update('test.txt', { colour: 'orange' })
                .then(() => container.meta('test.txt'))
                .then(meta => {
                    expect(meta).to.eql({
                        colour: 'orange'
                    });
                }));
        });
    });

    after(() => client.delete('swift-client-test'));
});