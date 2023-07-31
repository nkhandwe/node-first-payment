const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51MHoRzG2RI0foJga9uqIxXf0tne0nNWFY0oRudv8A1KUzOy8TX0mNjzLdoL29N2j7ZrTAWPqEvavM9r9Wo1zVCvU00mIX2aozb"
);
app.use(bodyParser.json());

const port = 5000;
let customerId;

app.post("/", async (req, res) => {
  res.send('Server Is Running')
})

app.post("/payment-sheet", async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  try {
    let customerId;
    const { amount, currency, email } = req.body;
    console.log(amount, currency, email);
    
    const customerList = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    
    //Checks the if the customer exists, if not creates a new customer
    if (customerList.data.length !== 0) {
      customerId = customerList.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: email,
      });
      customerId = customer.id;
    }
    
    // //   const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2022-11-15" }
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customerId,
        payment_method_types: ["card"],
      });
      
      res
      .json({
        id:paymentIntent.id,
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
        
      }).status(200)
      
    } catch (error) {
      res.json({
        error:error
      }).status(400)
    }
  });
  
  app.listen(port, () => console.log(`Hello word  listening on port ${port}!`));