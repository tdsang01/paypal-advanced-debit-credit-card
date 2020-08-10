'use strict';

/**
 *
 * PayPal Node JS SDK dependency
 */
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 *
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
function client(clientId, clientSecret) {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment(clientId, clientSecret));
}

/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 *
 */
function environment(clientId, clientSecret) {
    return new checkoutNodeJssdk.core.SandboxEnvironment(
        clientId, clientSecret
    );
}

module.exports = { client };
