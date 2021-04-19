'use strict';

const Toys = require('@hapipal/toys');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    requirements: {
        hapi: '>=19'
    },
    register(server, { disableFloc }) {

        server.ext('onPreResponse', (request, h) => {

            const { disableFloc: routeDisableFloc } = request.route.settings.plugins;

            if (routeDisableFloc || (disableFloc && routeDisableFloc !== false)) {
                Toys.header(request.response, 'permissions-policy', 'interest-cohort=()', { append: true });
            }

            return h.continue;
        });
    }
};
