const express = require('express');
const path = require('path');
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('./paypal-client');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('querystring');
const { get } = require('lodash');
const paypalClient = require('./paypal-client');

const clientId = 'AWOe8o_B2R68GxYWuWiOYbbfWKjmZdULIWgoqQk9aM84nNSwKNqaX1d-Wyq8_vNQDaHnCeHGrWFkXsVT';
const clientSecret = 'EIFtNl5dYCduAAI81V5ldi3IlZbJwtzRSRBhBPMhVkH1uKO6BVwG113J4ow_D054dSv9Bm4iLxDl6bKw';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 8888;

const router = express.Router();

router.get('/', async function (request, response) {
  let clientToken = null;
  try {
    const paypalAccessToken = await axios({
      url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
      headers:  {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: clientId,
        password: clientSecret,
      },
      data: qs.stringify({
        grant_type: 'client_credentials',
    }),
      method: 'POST',
    });

    const accessToken = get(paypalAccessToken, 'data.access_token');

    const paypalClientToken = await axios({
      url: 'https://api.sandbox.paypal.com/v1/identity/generate-token',
      headers:  {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
      },
      method: 'POST',
    });

    clientToken = get(paypalClientToken, 'data.client_token');
  } catch(e) {
    console.log(e);
  }
  console.log(clientToken)
  response.render('index', { title: 'Welcome!', clientToken });
});

router.post('/create-paypal-transaction', async function (req, res) {
  console.log('/create-paypal-transaction');

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    payer: {
      name: {
        given_name: "PayPal",
        surname: "Customer"
      },
      address: {
        address_line_1: '123 ABC Street',
        address_line_2: 'Apt 2',
        admin_area_2: 'San Jose',
        admin_area_1: 'CA',
        postal_code: '95121',
        country_code: 'US'
      },
      email_address: "customer@domain.com",
      phone: {
        phone_type: "MOBILE",
        phone_number: {
          national_number: "14082508100"
        }
      }
    },
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '220.00'
      }
    }],
    application_context: {
      shipping_preference: 'NO_SHIPPING'
    },
    billing_address: {
      postal_code: "555555",
      phone: "245234523452"
    }
  });

  let order;
  try {
    order = await payPalClient.client(clientId, clientSecret).execute(request);
    console.log('----------------------------------------')
    console.log(order)
    console.log('----------------------------------------')
  } catch (err) {

    // 4. Handle any errors from the call
    console.log('// 4. Handle any errors from the call');
    console.error(err);
    return res.send(500);
  }

  // 5. Return a successful response to the client with the order ID
  res.status(200).json({
    orderId: order.result.id
  });
});

// capture order
router.post('/capture-paypal-transaction', async function (req, res) {
  console.log('/capture-paypal-transaction');
  console.log('/body', req.body);

  const orderId = req.body.orderId;
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  try {
    const capture = await payPalClient.client(clientId, clientSecret).execute(request);

    console.log('------------------------capture----------------------------');
    console.log(capture);
    console.log('------------------------end capture----------------------------');

    // 4. Save the capture ID to your database. Implement logic to save capture to your database for future reference.
    const captureId = capture.result.purchase_units[0]
        .payments.captures[0].id;
   // await database.saveCaptureID(captureID);

   console.log('------------------------captureId----------------------------');
    console.log(captureId);
    console.log(orderId)
    console.log('------------------------end captureId----------------------------');

  } catch (err) {

    // 5. Handle any errors from the call
    console.error(err);
    return res.send(500);
  }

  // 6. Return a successful response to the client
  res.send(200);
});

router.get('/refund/:captureId', async (req, res, next) => {
  try {
    const { captureId } = req.params; // 95239267NY5212649

    const request = new paypal.payments.CapturesRefundRequest(captureId);
    paypal.payments.
    request.requestBody({
      amount: {
        currency_code: 'USD',
        value:         '22.22'
      }
    });

    const refund = await paypalClient.client(clientId, clientSecret).execute(request);

    console.log('------------------------------------REFUND--------------------------')
    console.log(refund)
    console.log('-------------------------------------END REFUND-------------------------')

    return res.render('index');
  } catch (e) {
    console.log({ e })
    return res.render('index');
  }
});


app.use('/', router);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
