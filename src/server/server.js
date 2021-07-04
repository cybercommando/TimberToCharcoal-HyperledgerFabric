var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const fabricNetwork = require('./fabricNetwork'),
  sampleData = require('../Repository/DataRepository');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.post('/api/initData', async function (req, res) {
  try {
    const contract1 = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    //let tx = await contract.submitTransaction('LoadData');

    //Data for Companies
    const companies = sampleData.CompanyData;
    for (let i = 0; i < companies.length; i++) {
      let comp = {
        companyId: companies[i].companyId,
        name: companies[i].name,
        status: companies[i].status,
        conversionRate: companies[i].conversionRate
      };
      await contract1.submitTransaction('registerCompany', JSON.stringify(comp));
    }

    const contract2 = await fabricNetwork.connectNetwork('connection-certifiedCompanies.json', 'wallet/wallet-certifiedCompanies');

    //Data for Invoices
    const invoices = sampleData.InvoiceData;
    for (let i = 0; i < invoices.length; i++) {
      let inv = {
        invoiceId: invoices[i].invoiceId,
        productId: invoices[i].productId,
        volumn: invoices[i].volumn,
        seller: invoices[i].seller,
        buyer: invoices[i].buyer,
        date: invoices[i].date,
        invoiceHash: invoices[i].invoiceHash
      }
      await contract2.submitTransaction('createInvoice', JSON.stringify(inv));
    }
    let tx = 'Sample Data initialized to the ledger';

    res.json({
      status: 'OK - Transaction has been submitted',
      response: tx.toString()
    });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

//==========================================/
//Invoice Registration
//==========================================/

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

app.get('/api/getInvoiceHistory/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readInvoiceHistory', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getAllInvoices', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readAllInvoices');
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

//==========================================/
//Certification
//==========================================/

app.post('/api/registerCompany', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    let comp = {
      companyId: req.body.companyId,
      name: req.body.name,
      status: req.body.status,
      conversionRate: req.body.conversionRate
    };
    let tx = await contract.submitTransaction('registerCompany', JSON.stringify(comp));
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

app.get('/api/getAllCompanies', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readAllCompanies');
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getCompany/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readCompany', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getCompanyStatusHistory/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readCompanyStatusHistory', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.put('/api/changeCompanyStatus', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');

    let tx = await contract.submitTransaction('changeStatus', req.body.companyId, req.body.status);
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


//==========================================/
//PerformAudit
//==========================================/
app.get('/api/performAudit', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('PerformAudit');
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

var serverObj = app.listen(3000, () => {
  console.log("***********************************");
  console.log("API Server listening at localhost:3000");
  console.log("***********************************");
});

serverObj.timeout = 1000000;