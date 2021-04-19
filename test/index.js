'use strict';

// Load modules

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const DontGiveAFloc = require('..');

// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('DontGiveAFloc', () => {

    it('registers without issue.', async () => {

        const server = Hapi.server();

        await server.register({
            plugin: DontGiveAFloc,
            options: { disableFloc: true }
        });

        await server.initialize();

        expect(server.registrations['dont-give-a-floc']).to.exist();
    });

    it('adds header to all routes when enabled.', async () => {

        const server = Hapi.server();

        await server.register({
            plugin: DontGiveAFloc,
            options: { disableFloc: true }
        });

        server.route({
            method: 'get',
            path: '/x',
            handler: () => 'x'
        });

        await server.register({
            name: 'y',
            register: (srv) => {

                srv.route({
                    method: 'post',
                    path: '/y',
                    handler: () => 'y'
                });
            }
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.result).to.equal('x');
        expect(x.headers['permissions-policy']).to.equal('interest-cohort=()');

        const y = await server.inject({ method: 'post', url: '/y' });
        expect(y.result).to.equal('y');
        expect(y.headers['permissions-policy']).to.equal('interest-cohort=()');
    });

    it('adds header to not-found routes when enabled.', async () => {

        const server = Hapi.server();

        await server.register({
            plugin: DontGiveAFloc,
            options: { disableFloc: true }
        });

        const unknown = await server.inject({ method: 'get', url: '/unknown' });
        expect(unknown.statusCode).to.equal(404);
        expect(unknown.headers['permissions-policy']).to.equal('interest-cohort=()');
    });

    it('does not add header to routes by default.', async () => {

        const server = Hapi.server();

        await server.register(DontGiveAFloc);

        server.route({
            method: 'get',
            path: '/x',
            handler: () => 'x'
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.result).to.equal('x');
        expect(x.headers).to.not.contain('permissions-policy');
    });

    it('does not add header to routes when explicitly disabled.', async () => {

        const server = Hapi.server();

        await server.register({
            plugin: DontGiveAFloc,
            options: { disableFloc: false }
        });

        server.route({
            method: 'get',
            path: '/x',
            handler: () => 'x'
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.result).to.equal('x');
        expect(x.headers).to.not.contain('permissions-policy');
    });

    it('does not add header to routes when explicitly disabled on route.', async () => {

        const server = Hapi.server();

        await server.register({
            plugin: DontGiveAFloc,
            options: { disableFloc: true }
        });

        server.route({
            method: 'get',
            path: '/x',
            options: {
                plugins: {
                    disableFloc: false
                },
                handler: () => 'x'
            }
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.result).to.equal('x');
        expect(x.headers).to.not.contain('permissions-policy');
    });

    it('adds header to routes when explicitly enabled on route.', async () => {

        const server = Hapi.server();

        await server.register({
            plugin: DontGiveAFloc,
            options: { disableFloc: false }
        });

        server.route({
            method: 'get',
            path: '/x',
            options: {
                plugins: {
                    disableFloc: true
                },
                handler: () => 'x'
            }
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.result).to.equal('x');
        expect(x.headers['permissions-policy']).to.equal('interest-cohort=()');
    });

    it('adds header to error responses.', async () => {

        const server = Hapi.server();

        await server.register(DontGiveAFloc);

        server.route({
            method: 'get',
            path: '/x',
            options: {
                plugins: {
                    disableFloc: true
                },
                handler: () => {

                    throw Boom.badRequest();
                }
            }
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.statusCode).to.equal(400);
        expect(x.result).to.equal({
            error: 'Bad Request',
            message: 'Bad Request',
            statusCode: 400
        });
        expect(x.headers['permissions-policy']).to.equal('interest-cohort=()');
    });

    it('appends to existing header.', async () => {

        const server = Hapi.server();

        await server.register(DontGiveAFloc);

        server.route({
            method: 'get',
            path: '/x',
            options: {
                plugins: {
                    disableFloc: true
                },
                handler: (_, h) => {

                    return h.response('x').header('permissions-policy', 'camera=()');
                }
            }
        });

        const x = await server.inject({ method: 'get', url: '/x' });
        expect(x.result).to.equal('x');
        expect(x.headers['permissions-policy']).to.equal('camera=(),interest-cohort=()');
    });
});
