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
        conversionRate: companies[i].conversionRate,
        certifier: companies[i].certifier
      };
      await contract1.submitTransaction('registerCompany', JSON.stringify(comp));
    }

    //Data for Certifiers
    const certifiers = sampleData.CertifierData;
    for (let i = 0; i < certifiers.length; i++) {
      let crt = {
        certifierId: certifiers[i].certifierId,
        certifierName: certifiers[i].certifierName,
        status: certifiers[i].status
      };
      await contract1.submitTransaction('registerCertifier', JSON.stringify(crt));
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
//Companies
app.post('/api/registerCompany', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    let comp = {
      companyId: req.body.companyId,
      name: req.body.name,
      status: req.body.status,
      conversionRate: req.body.conversionRate,
      certifier: req.body.certifier
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

app.get('/api/readCompanyHistoricConversionRate/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readCompanyHistoricConversionRate', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getCompanyHistory/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readCompanyHistory', req.params.id.toString());
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

//Certifiers
app.post('/api/registerCertifier', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    let crt = {
      certifierId: req.body.certifierId,
      certifierName: req.body.certifierName,
      status: req.body.status
    };
    let tx = await contract.submitTransaction('registerCertifier', JSON.stringify(crt));
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

app.get('/api/getAllCertifiers', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readAllCertifiers');
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getCertifier/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readCertifier', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.put('/api/changeCertifierStatus', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');

    let tx = await contract.submitTransaction('changeCertifierStatus', req.body.certifierId, req.body.status);
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

    for (let index = 0; index < response.length; index++) {
      const element = response[index];
      const comp = JSON.parse(await contract.evaluateTransaction('readCompany', element.seller));
      let nfID = 'NF'+Date.now();
      let ntf = {
        notificationId: nfID,
        certifierId: comp.certifier,
        certifiedCompanyId: element.seller,
        notificationType: 'FRAUDULENTBEHAVIOUR',
        comments: 'Detected as a fraudulent Behaviour',
        status: 'PENDING',
        newConversionRate: ''
      };
      let tx = await contract.submitTransaction('createNotification', JSON.stringify(ntf));
    }
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

//==========================================/
//Notification
//==========================================/
app.post('/api/createNotification', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiedCompanies.json', 'wallet/wallet-certifiedCompanies');
    let ntf = {
      notificationId: req.body.notificationId,
      certifierId: req.body.certifierId,
      certifiedCompanyId: req.body.certifiedCompanyId,
      notificationType: req.body.notificationType,
      comments: req.body.comments,
      status: req.body.status,
      newConversionRate: req.body.newConversionRate
    };
    let tx = await contract.submitTransaction('createNotification', JSON.stringify(ntf));
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

app.put('/api/resolveNotification', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');

    let tx = await contract.submitTransaction('resolveNotification', req.body.notificationId, req.body.certifierId, req.body.status);
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

app.get('/api/getAllNotifications', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readAllNotifications');
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getNotification/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readNotification', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getNotificationByCertifierId/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readNotificationsByCertifierId', req.params.id.toString());
    let response = JSON.parse(result.toString());
    res.json({ result: response });
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({
      error: error
    });
  }
});

app.get('/api/getNotificationHistory/:id', async function (req, res) {
  try {
    const contract = await fabricNetwork.connectNetwork('connection-certifiers.json', 'wallet/wallet-certifiers');
    const result = await contract.evaluateTransaction('readNotificationHistory', req.params.id.toString());
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