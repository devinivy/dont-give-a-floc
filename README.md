# dont-give-a-floc
Disable [FLoC](https://github.com/WICG/floc) on your hapi server

[![Build Status](https://travis-ci.org/devinivy/dont-give-a-floc.svg?branch=main)](https://travis-ci.org/devinivy/dont-give-a-floc) [![Coverage Status](https://coveralls.io/repos/devinivy/dont-give-a-floc/badge.svg?branch=main&service=github)](https://coveralls.io/github/devinivy/dont-give-a-floc?branch=main)

## Installation
```sh
npm install dont-give-a-floc
```

## Usage
This module is a hapi plugin to control whether FLoC is allowed on pages served by your hapi server, using the [Permissions-Policy](https://github.com/w3c/webappsec-permissions-policy/blob/main/permissions-policy-explainer.md) header.  You may disable FLoC to protect your users' privacy, preventing access to their cohorts via browser APIs (including in third-party scripts on your page), and opting your site out of FLoC calculations which are based on user browsing history.

Simply register the plugin to your server, optionally passing the `disableFloc` plugin option if you'd like it to take effect across all routes.  Otherwise, you can disable FLoC on individual routes using the `route.options.plugins.disableFloc` option.

### Example

```js
const Hapi = require('@hapi/hapi');
const DontGiveAFloc = require('dont-give-a-floc');

(async () => {

    const server = Hapi.server();

    await server.register(DontGiveAFloc);

    server.route({
        method: 'get',
        path: '/',
        options: {
            plugins: {
                disableFloc: true
            },
            handler(request, h) {

                return h.response(`<html>
                    <head><title>My FLoC-less Homepage</title></head>
                    <body>No FLoCs given!</body>
                </html>`).type('text/html');
            }
        }
    });
})();
```

## Extras

 - [WordPress to automatically disable Google FLoC on websites](https://www.bleepingcomputer.com/news/security/wordpress-to-automatically-disable-google-floc-on-websites/)
 - [Google’s FLoC Is a Terrible Idea](https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea)
 - [How can websites opt out of the FLoC computation?](https://developer.chrome.com/blog/floc/#how-can-websites-opt-out-of-the-floc-computation)
 - [Opting your Website out of Google's FLoC Network](https://paramdeo.com/blog/opting-your-website-out-of-googles-floc-network)
 - [How to fight back against Google FLoC](https://plausible.io/blog/google-floc)
 - [Am I FLoCed?](https://amifloced.org/)
 - [Federated Learning of Cohorts (FLoC)](https://github.com/WICG/floc)
