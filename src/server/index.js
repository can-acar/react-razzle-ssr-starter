//import App from '../common/containers/App';
//import {Provider} from 'react-redux';
import React from 'react';
import {Helmet} from 'react-helmet';
//import configureStore from '../common/store/configureStore';
import express from 'express';
//import {fetchCounter} from '../common/api/counter';
import qs from 'qs';
import {renderToString} from 'react-dom/server';
import {HelmetProvider} from "react-helmet-async";
import {StaticRouter} from 'react-router-dom';
import serialize from 'serialize-javascript';
import App from "../app/index";

const helmetContext = {
    htmlAttributes: {lang: 'tr'}
};
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();

server
    .disable('x-powered-by')
    .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
    .get('/*', (req, res) => {

        // Read the counter from the request, if provided
        const context = {};
        const params = qs.parse(req.query);
        const counter = parseInt(params.counter, 10) || 0;

        // Compile an initial state
        const preloadedState = {counter};

        // Create a new Redux store instance
        //const store = configureStore(preloadedState);

        // Render the component to a string
        const markup = renderToString(
            // <Provider store={store}>
            <HelmetProvider context={helmetContext}>
                <StaticRouter
                    location={req.url} context={context}>
                    <App/>
                </StaticRouter>
            </HelmetProvider>
        );

        // Grab the initial state from our Redux store
        //const finalState = store.getState();

        const helmet = Helmet.renderStatic();

        res.send(`<!doctype html>
    <html  ${helmet.htmlAttributes.toString()}>
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        ${helmet.title.toString()}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        ${helmet.meta.toString()} 
        ${helmet.link.toString()} 
        ${assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''}
   
    </head>
    <body ${helmet.bodyAttributes.toString()}>
        <div id="root" class="d-flex flex-column flex-root">${markup}</div>
        <script>
          window.__PRELOADED_STATE__ = ${serialize({})}
        </script>
   
        ${process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`}
    </body>
</html>`);
    });

export default server;
