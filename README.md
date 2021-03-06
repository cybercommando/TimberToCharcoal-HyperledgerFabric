# TimberToCharcoal-HyperledgerFabric
Blockchain based HyperledgerFabric network for Auditing of TimberToCharcoal Process.

# Installation instructions

1. Install Hyperledger fabric dependencies:
https://hyperledger-fabric.readthedocs.io/en/release-1.4/prereqs.html

2. Donwload fabric binaries and samples:
`curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.3`

3. Go to fabric samples:
`cd fabric-samples`

4. Download the template:
`git clone https://github.com/cybercommando/TimberToCharcoal-HyperledgerFabric.git`

5. Go to the folder
`cd TimberToCharcoal-HyperledgerFabric`


# Start the network

1. Download node modules before starting the network
`./network.sh install`

2. Generate the crypto material and start the network
`./network.sh start`


# Stop the network

`./network.sh stop`


# API Configuration


### Initialization of Sample Data

> It is compulsory to initialize the sample data first, to play with.
```
curl --request POST \
--url http://localhost:3000/api/initData \
--header 'content-type: application/json'
```

### To Perform Audit

```
curl --request GET \
--url 'http://localhost:3000/api/performAudit' \
--header 'content-type: application/json'
```

### For Companies

```
curl --request POST \
--url http://localhost:3000/api/registerCompany \
--header 'content-type: application/json' \
--data '{ "companyId":"CC020", "name":"Company 020", "status":"SUSPENDED", "conversionRate":"80", "certifier":"C02"}'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getAllCompanies' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getCompany/CC020' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/readCompanyHistoricConversionRate/CC020' \
--header 'content-type: application/json'
```

```
curl --request PUT \
--url http://localhost:3000/api/changeCompanyStatus \
--header 'content-type: application/json' \
--data '{ "companyId":"CC020", "status":"ACTIVE"}'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getCompanyHistory/CC020' \
--header 'content-type: application/json'
```

### For Certifiers

```
curl --request POST \
--url http://localhost:3000/api/registerCertifier \
--header 'content-type: application/json' \
--data '{ "certifierId":"C03", "certifierName":"Certifier 03", "status":"INACTIVE"}'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getAllCertifiers' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getCertifier/C03' \
--header 'content-type: application/json'
```

```
curl --request PUT \
--url http://localhost:3000/api/changeCertifierStatus \
--header 'content-type: application/json' \
--data '{ "certifierId":"C03", "status":"ACTIVE"}'
```

## For Invoices

```
curl --request POST \
--url http://localhost:3000/api/addInvoice \
--header 'content-type: application/json' \
--data '{ "invoiceId":"INV11", "productId":"10002", "volumn":"1000", "buyer":"CC005", "seller":"CC001", "date":"12/12/2021", "invoiceHash":"some temporary hash"}'
```

```
curl --request POST \
--url http://localhost:3000/api/addInvoice \
--header 'content-type: application/json' \
--data '{ "invoiceId":"INV09", "productId":"Timber Wood", "volumn":"2000", "buyer":"CC007", "seller":"CC004", "date":"03/23/2021", "invoiceHash":"some temporary hash"}'
```

```
curl --request POST \
--url http://localhost:3000/api/addInvoice \
--header 'content-type: application/json' \
--data '{ "invoiceId":"INV10", "productId":"Timber Wood", "volumn":"2000", "buyer":"CC007", "seller":"CC003", "date":"03/31/2021", "invoiceHash":"some temporary hash"}'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getInvoice/INV11' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getInvoiceHistory/INV01' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getAllInvoices' \
--header 'content-type: application/json'
```

### Notifications

```
curl --request POST \
--url http://localhost:3000/api/createNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0001", "certifierId":"C01", "certifiedCompanyId":"CC001", "notificationType":"CONVERSIONRATECHANGE", "comments":"Kindly Change this conversion rate with the old one", "status":"PENDING", "newConversionRate":"99"}'
```

```
curl --request POST \
--url http://localhost:3000/api/createNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0002", "certifierId":"C02", "certifiedCompanyId":"CC015", "notificationType":"CONVERSIONRATECHANGE", "comments":"Kindly Change this conversion rate with the old one", "status":"PENDING", "newConversionRate":"95"}'
```

```
curl --request PUT \
--url http://localhost:3000/api/resolveNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0001", "certifierId":"C01", "status":"DECLINED"}'
```

```
curl --request PUT \
--url http://localhost:3000/api/resolveNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0002", "certifierId":"C02", "status":"APPROVED"}'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getAllNotifications' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getNotification/N0001' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getNotificationHistory/N0001' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getNotificationByCertifierId/C01' \
--header 'content-type: application/json'
```

### Notification for Fraudulent Behaviour

```
curl --request POST \
--url http://localhost:3000/api/createNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"NF001", "certifierId":"C02", "certifiedCompanyId":"CC009", "notificationType":"FRAUDULENTBEHAVIOUR", "comments":"Detected as a fraudulent Behaviour", "status":"PENDING"}'
```

```
curl --request POST \
--url http://localhost:3000/api/createNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"NF002", "certifierId":"C02", "certifiedCompanyId":"CC010", "notificationType":"FRAUDULENTBEHAVIOUR", "comments":"Detected as a fraudulent Behaviour", "status":"PENDING"}'
```

```
curl --request PUT \
--url http://localhost:3000/api/resolveNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"NF001", "certifierId":"C02", "status":"APPROVED"}'
```

```
curl --request PUT \
--url http://localhost:3000/api/resolveNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"NF002", "certifierId":"C02", "status":"APPROVED"}'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getCompanyHistory/CC009' \
--header 'content-type: application/json'
```

```
curl --request GET \
--url 'http://localhost:3000/api/getCompanyHistory/CC010' \
--header 'content-type: application/json'
```