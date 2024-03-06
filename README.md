# TimberToCharcoal-HyperledgerFabric
Blockchain based HyperledgerFabric network for Auditing of TimberToCharcoal Process.

>The documentation of the code is auto generated using JSDOC library.
>Find the folder named documentation and run the index.html file in any web browser to see.

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

> If commands need super user privilege then try running the command with sudo prefix.
> For example: `sudo ./network.sh start`

1. Download node modules before starting the network
`./network.sh install`

2. Generate the crypto material and start the network
`./network.sh start`


# Stop the network

`./network.sh stop`

# Demonstration Videos

> There are 5 Videos which will show you running the chain code and performing all the api request with results. See in demonstration videos folder.

`1 - Start Network and Performing Audit`
`2 - Company Record Management`
`3 - Certifier Record Management`
`4 - Invoice Record Management`
`5 - Notification Change Conversion Rate Request`


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

> This request will create a new company.
```
curl --request POST \
--url http://localhost:3000/api/registerCompany \
--header 'content-type: application/json' \
--data '{ "companyId":"CC020", "name":"Company 020", "status":"SUSPENDED", "conversionRate":"80", "certifier":"C02"}'
```

> This request will get a list of all the Companies.
```
curl --request GET \
--url 'http://localhost:3000/api/getAllCompanies' \
--header 'content-type: application/json'
```

> This request will get the company with ID CC020.
```
curl --request GET \
--url 'http://localhost:3000/api/getCompany/CC020' \
--header 'content-type: application/json'
```

> This request will get the Historical Conversion Rate of the Company having ID CC020
```
curl --request GET \
--url 'http://localhost:3000/api/readCompanyHistoricConversionRate/CC020' \
--header 'content-type: application/json'
```

> This request will change the company status to ACTIVE.
```
curl --request PUT \
--url http://localhost:3000/api/changeCompanyStatus \
--header 'content-type: application/json' \
--data '{ "companyId":"CC020", "status":"ACTIVE"}'
```

> This request will get the list of versions, of all the changes made in the Company data having ID CC020
```
curl --request GET \
--url 'http://localhost:3000/api/getCompanyHistory/CC020' \
--header 'content-type: application/json'
```

### For Certifiers

> This request will register a new certifier.
```
curl --request POST \
--url http://localhost:3000/api/registerCertifier \
--header 'content-type: application/json' \
--data '{ "certifierId":"C03", "certifierName":"Certifier 03", "status":"INACTIVE"}'
```

> This request will get a List of all Certifiers.
```
curl --request GET \
--url 'http://localhost:3000/api/getAllCertifiers' \
--header 'content-type: application/json'
```

> This request will get the certifier having Id C03
```
curl --request GET \
--url 'http://localhost:3000/api/getCertifier/C03' \
--header 'content-type: application/json'
```

> This request will change the Certifier status to ACTIVE.
```
curl --request PUT \
--url http://localhost:3000/api/changeCertifierStatus \
--header 'content-type: application/json' \
--data '{ "certifierId":"C03", "status":"ACTIVE"}'
```

## For Invoices

> This request will upload an invoice data to the ledger.
```
curl --request POST \
--url http://localhost:3000/api/addInvoice \
--header 'content-type: application/json' \
--data '{ "invoiceId":"INV11", "productId":"10002", "volumn":"1000", "buyer":"CC005", "seller":"CC001", "date":"12/12/2021", "invoiceHash":"some temporary hash"}'
```

> This request is also upload the invoice data to the ledger.
> This request will throw and exception because the seller and buyer both has SUSPENDED status.
> Uploading invoice data to ledger is prohibited when any of the company status is SUSPENDED.
```
curl --request POST \
--url http://localhost:3000/api/addInvoice \
--header 'content-type: application/json' \
--data '{ "invoiceId":"INV09", "productId":"Timber Wood", "volumn":"2000", "buyer":"CC007", "seller":"CC004", "date":"03/23/2021", "invoiceHash":"some temporary hash"}'
```

> This request is also upload the invoice data to the ledger.
> This request will throw and exception because the seller has ACTIVE status but the buyer has SUSPENDED status.
> Uploading invoice data to ledger is prohibited when any of the company status is SUSPENDED.
```
curl --request POST \
--url http://localhost:3000/api/addInvoice \
--header 'content-type: application/json' \
--data '{ "invoiceId":"INV10", "productId":"Timber Wood", "volumn":"2000", "buyer":"CC007", "seller":"CC003", "date":"03/31/2021", "invoiceHash":"some temporary hash"}'
```

> This request will get the Invoice having Id INV11
```
curl --request GET \
--url 'http://localhost:3000/api/getInvoice/INV11' \
--header 'content-type: application/json'
```

> This request will get the list of versions of all the changes made in the Invoice data having ID INV01
```
curl --request GET \
--url 'http://localhost:3000/api/getInvoiceHistory/INV01' \
--header 'content-type: application/json'
```
> This request will get the list of all Invoices.
```
curl --request GET \
--url 'http://localhost:3000/api/getAllInvoices' \
--header 'content-type: application/json'
```

### Notifications

> This request will create a notification to change the conversion rate.
> Company CC001 is makind request with notification type CONVERSIONRATECHANGE to Certifier C01
```
curl --request POST \
--url http://localhost:3000/api/createNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0001", "certifierId":"C01", "certifiedCompanyId":"CC001", "notificationType":"CONVERSIONRATECHANGE", "comments":"Kindly Change this conversion rate with the old one", "status":"PENDING", "newConversionRate":"99"}'
```

> This request will create a notification to change the conversion rate.
> Company CC0015 is makind request with notification type CONVERSIONRATECHANGE to Certifier C02
```
curl --request POST \
--url http://localhost:3000/api/createNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0002", "certifierId":"C02", "certifiedCompanyId":"CC015", "notificationType":"CONVERSIONRATECHANGE", "comments":"Kindly Change this conversion rate with the old one", "status":"PENDING", "newConversionRate":"95"}'
```

> This request will resolve a notification having notification Id N0001 By DECLINING It.
```
curl --request PUT \
--url http://localhost:3000/api/resolveNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0001", "certifierId":"C01", "status":"DECLINED"}'
```

> This request will resolve a notification having notification Id N0002 By Approving It.
```
curl --request PUT \
--url http://localhost:3000/api/resolveNotification \
--header 'content-type: application/json' \
--data '{ "notificationId":"N0002", "certifierId":"C02", "status":"APPROVED"}'
```

> This request will get all the notifications.
```
curl --request GET \
--url 'http://localhost:3000/api/getAllNotifications' \
--header 'content-type: application/json'
```

> This request will get a single notification having Id N0001
```
curl --request GET \
--url 'http://localhost:3000/api/getNotification/N0001' \
--header 'content-type: application/json'
```

> This request will get the list of version of changes made in Notification having ID N0001
```
curl --request GET \
--url 'http://localhost:3000/api/getNotificationHistory/N0001' \
--header 'content-type: application/json'
```

>This request will get the list of notifications associated with Certifier having Id C01.
```
curl --request GET \
--url 'http://localhost:3000/api/getNotificationByCertifierId/C01' \
--header 'content-type: application/json'
```

### Notification for Fraudulent Behaviour

> This is a bit tricky part to operate.
> After performing the Audit, Notification will generate automatically with random Ids.
> First fetch all the notifications. Then resolve the notifications by replacing the notificationId in bellow requests. Notification Ids mentioned in below requests are orbitrary.
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

> These requests will show you the changes status of the companies after resolving notifications.
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