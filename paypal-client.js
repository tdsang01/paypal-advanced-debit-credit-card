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
function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 *
 */
function environment() {
    let clientId = 'AWOe8o_B2R68GxYWuWiOYbbfWKjmZdULIWgoqQk9aM84nNSwKNqaX1d-Wyq8_vNQDaHnCeHGrWFkXsVT';
    let clientSecret = 'EGjZt1nyw9K8OtHK_WAvdHG8iMak4ylcDkWMPByz07RvOzF0pT6CePyCvJJQLYAZ7xQ85dmWJLta7Bkd';

    return new checkoutNodeJssdk.core.SandboxEnvironment(
        clientId, clientSecret
    );
}

module.exports = { client };
