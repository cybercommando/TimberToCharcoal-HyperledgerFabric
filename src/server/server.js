var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const fabricNetwork = require('./fabricNetwork')
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.post('/api/addInvoice', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiedCompanies.json', 'wallet/wallet-certifiedCompanies');
    let inv = {
      invoiceId: req.body.invoiceId,
      productId: req.body.productId,
      volumn: req.body.volumn,
      seller: req.body.seller,
      buyer: req.body.buyer,
      date: req.body.date,
      invoiceHash: req.body.invoiceHash
    }
    let tx = await contract.submitTransaction('createInvoice', JSON.stringify(inv));
    res.json({
      status: 'OK - Transaction has been submitted',
      txid: tx.toString()
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getInvoice/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiedCompanies.json', 'wallet/wallet-certifiedCompanies');
    const result = await contract.evaluateTransaction('readInvoice', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.listen(3000, () => {
  console.log("***********************************");
  console.log("API Server listening at localhost:3000");
  console.log("***********************************");
});
