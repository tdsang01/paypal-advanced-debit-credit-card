const express = require('express');
const path = require('path');
const paypal = require('@paypal/checkout-server-sdk');
const payPalClient = require('./paypal-client');
const bodyParser = require('body-parser');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 8888;

const router = express.Router();

router.get('/', function (request, response) {
  response.render('index', { title: 'Welcome!' });
});

router.post('/create-paypal-transaction', async function (req, res) {
  console.log('/create-paypal-transaction');

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: '220.00'
      }
    }]
  });

  let order;
  try {
    order = await payPalClient.client().execute(request);
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
    const capture = await payPalClient.client().execute(request);

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




app.use('/', router);

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});