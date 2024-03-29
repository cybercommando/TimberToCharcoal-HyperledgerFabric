'use strict';

const { Certifier } = require('./Models/Certifier');
const { Notification } = require('./Models/Notification');
const { BaseContract } = require('./Services/base-contract');
const { Invoice } = require('./Models/Invoice');
const { Company } = require('./Models/Company');
const events = require('./Services/events');

/**
 * This is the main Smart Contract Class
 */
class CharcoalContract extends BaseContract {
    /**
     * @constructor
     */
    constructor() {
        super('com.timbertocharcoal.charcoalcontract');
    }

    /**
     * This method is for initializing the ledger with default value.
     * This method is only for the purpose of testing Hyperledger Immutability
     * @param {ctx} ctx - Request Context
     * @returns {JSON} Transaction ID
     */
    async initLedger(ctx) {
        console.info('============ Start: Initialize Ledger ============');
        const tempCompany = {
            companyId : 'CC020',
            name : 'Company 020',
            status : 'SUSPENDED',
            conversionRate : '80',
            certifier : 'C02'
        };

        // Object Creation from parameters
        const comp = Company.from(tempCompany).toBuffer();
        // Inserting Record in Ledger
        await ctx.stub.putState(this._createCompanyCompositKey(ctx.stub, tempCompany.companyId.toString()), comp);
        ctx.stub.setEvent(events.CompanyInserted, comp);
        console.info('============ End: Initialize Ledger ============');
        return ctx.stub.getTxID();
    }

    //==========================================/
    // Invoice Registration
    //==========================================/

    /**
     * This method validates the invoice data and saves in the ledger.
     * @param {ctx} ctx - Request Context
     * @param {Invoice} invoice - Invoice data in the form of JSON
     * @returns {JSON} Transaction ID
     */
    async createInvoice(ctx, invoice) {
        const tempInvoice = JSON.parse(invoice);
        //Validation
        this._requireCertifiedCompanies(ctx);
        this._require(tempInvoice.invoiceId.toString(), 'Invoice Id');
        this._require(tempInvoice.productId.toString(), 'Product Id');
        this._require(tempInvoice.volumn.toString(), 'Volumn');
        this._require(tempInvoice.seller.toString(), 'Seller');
        this._require(tempInvoice.buyer.toString(), 'Buyer');
        this._require(tempInvoice.date.toString(), 'Date');
        this._require(tempInvoice.invoiceHash.toString(), 'Invoice Hash');

        //Check Seller Certificate Here
        if (await this._doesStateExist(ctx.stub, this._createCompanyCompositKey(ctx.stub, tempInvoice.seller.toString()))) {
            const sellerInstance = await this._getCompany(ctx.stub, tempInvoice.seller.toString());
            if (sellerInstance.status !== 'ACTIVE') {
                throw new Error(`Error: The Seller having ID: ${tempInvoice.seller}, doesn't have ACTIVE Certification Status`);
            }
        } else {
            throw new Error(`Error: The provided Seller having ID: ${tempInvoice.seller}, is not registered.`);
        }

        //Check Buyer Certificate Here
        if (await this._doesStateExist(ctx.stub, this._createCompanyCompositKey(ctx.stub, tempInvoice.buyer.toString()))) {
            const buyerInstance = await this._getCompany(ctx.stub, tempInvoice.buyer.toString());
            if (buyerInstance.status !== 'ACTIVE') {
                throw new Error(`Error: The Buyer having ID: ${tempInvoice.buyer}, doesn't have ACTIVE Certification Status`);
            }
        } else {
            throw new Error(`Error: The provided Buyer having ID: ${tempInvoice.buyer}, is not registered.`);
        }

        if (await this._doesStateExist(ctx.stub, this._createInvoiceCompositKey(ctx.stub, tempInvoice.invoiceId.toString()))) {
            //Update Existing State
            const existingInvoice = await this._getInvoice(ctx.stub, tempInvoice.invoiceId.toString());
            existingInvoice.productId = tempInvoice.productId.toString();
            existingInvoice.volumn = tempInvoice.volumn.toString();
            existingInvoice.seller = tempInvoice.seller.toString();
            existingInvoice.buyer = tempInvoice.buyer.toString();
            existingInvoice.date = tempInvoice.date.toString();
            existingInvoice.invoiceHash = tempInvoice.invoiceHash.toString();
            await ctx.stub.putState(this._createInvoiceCompositKey(ctx.stub, tempInvoice.invoiceId.toString()), existingInvoice.toBuffer());
            ctx.stub.setEvent(events.InvoiceUpdated, existingInvoice.toBuffer());
        } else {
            //Object Creation from parameters
            const inv = Invoice.from(tempInvoice).toBuffer();
            //Inserting Record in Ledger
            await ctx.stub.putState(this._createInvoiceCompositKey(ctx.stub, tempInvoice.invoiceId.toString()), inv);
            ctx.stub.setEvent(events.InvoiceInserted, inv);
        }
        return ctx.stub.getTxID();
    }

    /**
     * This method reads the invoice data from ledger by invoice Id.
     * @param {ctx} ctx - Request Context
     * @param {string} invoiceId - Invoice Id
     * @returns {JSON} Invoice object in the form of JSON
     */
    async readInvoice(ctx, invoiceId) {
        // Validation
        this._require(invoiceId.toString(), 'Invoice Id');
        return await this._getInvoice(ctx.stub, invoiceId.toString());
    }

    /**
     * When ever a state changes, Ledger also maintains the pervious changed versions.
     * This method reads all the versions of single state of Invoice.
     * @param {ctx} ctx - Request Context
     * @param {string} invoiceId - Invoice Id
     * @returns {JSON} Invoice object in the form of JSON
     */
    async readInvoiceHistory(ctx, invoiceId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(invoiceId.toString(), 'Invoice Id');
        let iterator = await ctx.stub.getHistoryForKey(this._createInvoiceCompositKey(ctx.stub, invoiceId.toString()));
        const allResults = [];
        let result;
        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }

    /**
     * This method reads all Invoices stored in Ledger.
     * @param {ctx} ctx - Request Context
     * @returns {JSON} List of Invoice objects in the form of JSON
     */
    async readAllInvoices(ctx) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('invoice', []);
        const allResults = [];
        let result;
        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }

    //==========================================/
    // Certification
    //==========================================/
    // Certified Companies
    //------------------------------------------/

    /**
     * This method validates the company data and saves in the ledger.
     * @param {ctx} ctx - Request Context
     * @param {Company} company - Company data in the form of JSON
     * @returns {JSON} Transaction ID
     */
    async registerCompany(ctx, company) {
        const tempCompany = JSON.parse(company);
        // Validation
        this._requireCertifiers(ctx);
        this._require(tempCompany.companyId.toString(), 'Company Id');
        this._require(tempCompany.name.toString(), 'Company Name');
        this._require(tempCompany.status.toString(), 'Company Status');
        this._require(tempCompany.conversionRate.toString(), 'Conversion Rate');
        this._require(tempCompany.certifier.toString(), 'Certifier');
        // Object Creation from parameters
        const comp = Company.from(tempCompany).toBuffer();
        // Inserting Record in Ledger
        await ctx.stub.putState(this._createCompanyCompositKey(ctx.stub, tempCompany.companyId.toString()), comp);
        ctx.stub.setEvent(events.CompanyInserted, comp);
        return ctx.stub.getTxID();
    }

    /**
     * This method reads the company data from ledger by company Id.
     * @param {ctx} ctx - Request Context
     * @param {string} companyId - Company Id
     * @returns {JSON} Company object in the form of JSON
     */
    async readCompany(ctx, companyId) {
        // Validation
        //this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');
        return await this._getCompany(ctx.stub, companyId.toString());
    }

    /**
     * This method calculates the historical convesion rate of a company
     * by accessing the all the records and calculating average of all conversion rates.
     * @param {ctx} ctx - Request Context
     * @param {sring} companyId - Company Identifier
     * @returns {JSON} Transaction Id
     */
    async readCompanyHistoricConversionRate(ctx, companyId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');
        let counter = 0;
        let historicConversionRate = 0;
        let companyHistory = await this.readCompanyHistory(ctx, companyId);
        for (let i = 0; i < companyHistory.length; i++) {
            counter++;
            historicConversionRate += companyHistory[i].conversionRate;
        }
        if (counter === 0) {
            return 0;
        } else {
            return historicConversionRate / counter;
        }
    }

    /**
     * This method reads all Companies stored in Ledger.
     * @param {ctx} ctx - Request Context
     * @returns {JSON} List of Company objects in the form of JSON
     */
    async readAllCompanies(ctx) {
        // Validation
        this._requireCertifiers(ctx);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('company', []);
        const allResults = [];
        let result;
        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }

    /**
     * This method will access the company state and update the status with new provided status.
     * @param {ctx} ctx - Request Context
     * @param {string} companyId - Company Identifier
     * @param {string} status - Status (ACTIVE | SUSPENDED)
     * @returns {JSON} Transaction Id
     */
    async changeStatus(ctx, companyId, status) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');
        this._require(status.toString(), 'Status');
        if (status.toString() === 'ACTIVE' || status.toString() === 'SUSPENDED') {
            const companyInstance = await this._getCompany(ctx.stub, companyId);

            companyInstance.status = status;

            await ctx.stub.putState(this._createCompanyCompositKey(ctx.stub, companyId), companyInstance.toBuffer());

            ctx.stub.setEvent(events.CompanyStatusChanged, companyInstance.toBuffer());

            return ctx.stub.getTxID();
        } else {
            throw new Error(`Error: The provided Status: ${status}, is not valid`);
        }
    }

    /**
     * This method will change the conversion rate with new conversion rate provided by the company.
     * @param {ctx} ctx - Request Context
     * @param {string} companyId - Company Identifier
     * @param {string} conversionRate - New conversion rate of the company which needs to be replaced with previous rate.
     * @returns {JSON} Transaction Id
     */
    async changeConversionRate(ctx, companyId, conversionRate) {
        // Validation
        //this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');
        this._require(conversionRate.toString(), 'Conversion Rate');
        const companyInstance = await this._getCompany(ctx.stub, companyId);
        companyInstance.conversionRate = conversionRate.toString();
        await ctx.stub.putState(this._createCompanyCompositKey(ctx.stub, companyId), companyInstance.toBuffer());
        ctx.stub.setEvent(events.CompanyConversionRateChanged, companyInstance.toBuffer());
        return ctx.stub.getTxID();
    }

    /**
     * When ever a state changes, Ledger also maintains the pervious changed versions.
     * This method reads all the versions of single state of Company.
     * @param {ctx} ctx - Request Context
     * @param {string} companyId - Company Id
     * @returns {JSON} Company object in the form of JSON
     */
    async readCompanyHistory(ctx, companyId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');
        let iterator = await ctx.stub.getHistoryForKey(this._createCompanyCompositKey(ctx.stub, companyId.toString()));
        const allResults = [];
        let result;
        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }

    //------------------------------------------/
    // Certifier
    //------------------------------------------/

    /**
     * This method validates the certifier data and saves in the ledger.
     * @param {ctx} ctx - Request Context
     * @param {Certifier} certifier - Invoice data in the form of JSON
     * @returns {JSON} Transaction ID
     */
    async registerCertifier(ctx, certifier) {
        const tempCertifier = JSON.parse(certifier);
        // Validation
        this._requireCertifiers(ctx);
        this._require(tempCertifier.certifierId.toString(), 'Certifier Id');
        this._require(tempCertifier.certifierName.toString(), 'Certifier Name');
        this._require(tempCertifier.status.toString(), 'Certifier Status');
        // Object Creation from parameters
        const crt = Certifier.from(tempCertifier).toBuffer();
        // Inserting Record in Ledger
        await ctx.stub.putState(this._createCertifierCompositKey(ctx.stub, tempCertifier.certifierId.toString()), crt);
        ctx.stub.setEvent(events.CertifierInserted, crt);
        return ctx.stub.getTxID();
    }

    /**
     * This method reads the certifier data from ledger by certifier Id.
     * @param {ctx} ctx - Request Context
     * @param {string} certifierId - Certifier Id
     * @returns {JSON} Certifier object in the form of JSON
     */
    async readCertifier(ctx, certifierId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(certifierId.toString(), 'Certifier Id');
        return await this._getCertifier(ctx.stub, certifierId.toString());
    }

    /**
     * This method reads all Certifiers stored in Ledger.
     * @param {ctx} ctx - Request Context
     * @returns {JSON} List of Certifier objects in the form of JSON
     */
    async readAllCertifiers(ctx) {
        //Validation
        this._requireCertifiers(ctx);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('certifier', []);
        const allResults = [];
        let result;
        do {
            result = await iterator.next();
            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        }
        while (!result.done);
        await iterator.close();
        return allResults;
    }

    /**
     * This method will change the status of Certifier.
     * @param {ctx} ctx - Request Context
     * @param {string} certifierId - Certifier Id
     * @param {string} status - Status (ACTIVE | INACTIVE)
     * @returns {JSON} Transaction ID
     */
    async changeCertifierStatus(ctx, certifierId, status) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(certifierId.toString(), 'Certifier Id');
        this._require(status.toString(), 'Status');
        if (status.toString() === 'ACTIVE' || status.toString() === 'INACTIVE') {
            const certifierInstance = await this._getCertifier(ctx.stub, certifierId);

            certifierInstance.status = status;

            await ctx.stub.putState(this._createCertifierCompositKey(ctx.stub, certifierId), certifierInstance.toBuffer());

            ctx.stub.setEvent(events.CertifierStatusChanged, certifierInstance.toBuffer());

            return ctx.stub.getTxID();
        } else {
            throw new Error(`Error: The provided Status: ${status}, is not valid`);
        }
    }

    //==========================================/
    // Audit
    //==========================================/

    /**
     * This is the a very Important method. It Trarse through all the Invoices and find out the
     * mis-complient invoices.
     * @param {ctx} ctx - Request Context
     * @returns {JSON} Returns the List of Invoices which are mis-complient.
     */
    async PerformAudit(ctx) {
        let FinalResult = [];
        // Validation
        this._requireCertifiers(ctx);
        let Invoices = await this.readAllInvoices(ctx);
        for (let i = 0; i < Invoices.length; i++) {
            let InvoiceHistory = await this.readInvoiceHistory(ctx, Invoices[i].invoiceId);
            // Holding Previous Invoice Volumn
            let prevVolumn = 0;
            for (let j = 0; j < InvoiceHistory.length; j++) {
                const invoice = InvoiceHistory[j];
                if (j === 0) {
                    prevVolumn = invoice.volumn;
                } else {
                    //==========================================/
                    // Compare Aggregate Volumns
                    //==========================================/
                    let AggregateComparisonResult = await this.CompareAggregateVolumes(ctx, prevVolumn, invoice);
                    //==========================================/
                    // Conversion Rate
                    //==========================================/
                    let ConversionRateComparisonResult = await this.CompareConversionRate(ctx, prevVolumn, invoice);
                    //==========================================/
                    // Comparison
                    //==========================================/
                    let result = await this.ProcessComparisonResults(ctx, AggregateComparisonResult, ConversionRateComparisonResult);
                    if (result) {
                        FinalResult.push(invoice);
                    }
                    prevVolumn = invoice.volumn;
                }
            }
        }
        return FinalResult;
    }

    //==========================================/
    // Compare Aggregate Volumns
    //==========================================/

    /**
     * This method will calulate the Aggregate Volume and compare it with purchased volume.
     * @param {ctx} ctx - Request Context
     * @param {string} prevVolumn - The value of this parameter is considered the sellers purchased volume
     * @param {Invoice} invoice - Instance of Sellers Invoice to Buyer
     * @returns {Boolean} Return True for Mis-complience and False for fair play
     */
    async CompareAggregateVolumes(ctx, prevVolumn, invoice) {
        // ExtractPurchasedVolumes
        let purchasedVolumn = invoice.volumn;
        // CalculateAggregateVolume
        const seller = await this.readCompany(ctx, invoice.seller);
        let aggregatedVolumn = (seller.conversionRate / 100) * prevVolumn;
        if (purchasedVolumn > aggregatedVolumn) {
            return true;
        }
        return false;
    }

    //==========================================/
    // Compare Conversion Rate
    //==========================================/

    /**
     * This method will calculate the Implicit Conversion rate and compare it with Historical conversion rate
     * of the Seller.
     * @param {ctx} ctx - Request Context
     * @param {string} prevVolumn - The value of this parameter is considered the sellers purchased volume
     * @param {Invoice} invoice - Instance of Sellers Invoice to Buyer
     * @returns {Boolean} Return True for Mis-complience and False for fair play
     */
    async CompareConversionRate(ctx, prevVolumn, invoice) {
        // CalculateImplicitConversionRate
        let implicitCR = (invoice.volumn / prevVolumn) * 100;
        // ExtractHistoricConversionRate
        let historicCR = await this.readCompanyHistoricConversionRate(ctx, invoice.seller);
        // DeviationCheck
        let Deviation = 0;
        const comp = await this.readCompany(ctx, invoice.seller);
        if (comp.conversionRate <= 50) {
            Deviation = 2;
        } else {
            Deviation = 5;
        }
        //CompareConversionRate
        if ((Math.abs(historicCR - implicitCR) > Deviation)) {
            return true;
        }
        return false;
    }


    //==========================================/
    // Process Comparison Results
    //==========================================/

    /**
     * This method will return true if any of the parameter contains true.
     * return True means, There is a mis-complience in Invoice.
     * @param {ctx} ctx - Request Context
     * @param {Boolean} AggVolume - Comparison Result of Aggregated Volumes
     * @param {Boolean} CR -Comparison Result of Conversion rates of the Seller
     * @returns {Boolean} Return True for Mis-complience and False for fair play
     */
    async ProcessComparisonResults(ctx, AggVolume, CR) {
        if (AggVolume || CR) {
            return true;
        }
        return false;
    }

    //==========================================/
    // Notifications
    //==========================================/

    /**
     * This method validates the Notification data and saves in the ledger.
     * @param {ctx} ctx - Request Context
     * @param {Notification} notification - Notification data in the form of JSON
     * @returns {JSON} Transaction ID
     */
    async createNotification(ctx, notification) {
        const tempNotification = JSON.parse(notification);
        // Validation
        this._require(tempNotification.notificationId.toString(), 'Notification Id');
        this._require(tempNotification.certifierId.toString(), 'Certifier Id');
        this._require(tempNotification.certifiedCompanyId.toString(), 'Certified Company Id');
        this._require(tempNotification.notificationType.toString(), 'Notification Type');
        this._require(tempNotification.comments.toString(), 'Comments');
        this._require(tempNotification.status.toString(), 'Status');
        if (tempNotification.notificationType.toString() === 'CONVERSIONRATECHANGE') {
            this._require(tempNotification.newConversionRate.toString(), 'New Conversion Rate');
        }
        // Object Creation from parameters
        const ntf = Notification.from(tempNotification).toBuffer();
        // Inserting Record in Ledger
        await ctx.stub.putState(this._createNotificationCompositKey(ctx.stub, tempNotification.notificationId.toString()), ntf);
        ctx.stub.setEvent(events.NotificationCreated, ntf);
        return ctx.stub.getTxID();
    }

    /**
     * This method will change Accept or Declined the notification status.
     * @param {ctx} ctx - Request Context
     * @param {string} notificationId - Notification Identifier
     * @param {string} certifierId - Certifier Identifier
     * @param {string} status - Status (APPROVED | DECLINED)
     * @returns {JSON} Transaction ID
     */
    async resolveNotification(ctx, notificationId, certifierId, status) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(notificationId.toString(), 'Notification Id');
        this._require(certifierId.toString(), 'Certifier Id');
        this._require(status.toString(), 'Status');
        if (status.toString() === 'APPROVED') {
            const NotificationInstance = await this._getNotification(ctx.stub, notificationId);
            if (NotificationInstance.notificationType === 'FRAUDULENTBEHAVIOUR') {
                await this.changeStatus(ctx, NotificationInstance.certifiedCompanyId, 'SUSPENDED');

                NotificationInstance.status = status.toString();
                await ctx.stub.putState(this._createNotificationCompositKey(ctx.stub, notificationId), NotificationInstance.toBuffer());
                ctx.stub.setEvent(events.NotificationResolved, NotificationInstance.toBuffer());
                return ctx.stub.getTxID();

            } else if (NotificationInstance.notificationType === 'CONVERSIONRATECHANGE') {
                await this.changeConversionRate(ctx, NotificationInstance.certifiedCompanyId, NotificationInstance.newConversionRate);

                NotificationInstance.status = status.toString();
                await ctx.stub.putState(this._createNotificationCompositKey(ctx.stub, notificationId), NotificationInstance.toBuffer());
                ctx.stub.setEvent(events.NotificationResolved, NotificationInstance.toBuffer());
                return ctx.stub.getTxID();
            } else {
                throw new Error(`Error: The Notification Type: ${NotificationInstance.notificationType}, is not valid`);
            }
        } else if (status.toString() === 'DECLINED') {
            const NotificationInstance = await this._getNotification(ctx.stub, notificationId);
            NotificationInstance.status = status.toString();
            await ctx.stub.putState(this._createNotificationCompositKey(ctx.stub, notificationId), NotificationInstance.toBuffer());
            ctx.stub.setEvent(events.NotificationResolved, NotificationInstance.toBuffer());
            return ctx.stub.getTxID();
        } else {
            throw new Error(`Error: The provided Status: ${status}, is not valid`);
        }
    }

    /**
     * This method reads all Notifications stored in Ledger.
     * @param {ctx} ctx - Request Context
     * @returns {JSON} List of Notification objects in the form of JSON
     */
    async readAllNotifications(ctx) {
        // Validation
        this._requireCertifiers(ctx);

        const iterator = await ctx.stub.getStateByPartialCompositeKey('notification', []);

        const allResults = [];
        let result;

        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }

    /**
     * This method reads the notification data from ledger by notification Id.
     * @param {ctx} ctx - Request Context
     * @param {string} notificationId - Notificcation Id
     * @returns {JSON} Notification object in the form of JSON
     */
    async readNotification(ctx, notificationId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(notificationId.toString(), 'Notification Id');
        return await this._getNotification(ctx.stub, notificationId.toString());
    }

    /**
     * When ever a state changes, Ledger also maintains the pervious changed versions.
     * This method reads all the versions of single state of Notification.
     * @param {ctx} ctx - Request Context
     * @param {string} notificationId - Notification Id
     * @returns {JSON} Notification object in the form of JSON
     */
    async readNotificationHistory(ctx, notificationId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(notificationId.toString(), 'Notification Id');
        let iterator = await ctx.stub.getHistoryForKey(this._createNotificationCompositKey(ctx.stub, notificationId.toString()));
        const allResults = [];
        let result;
        do {
            result = await iterator.next();
            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                allResults.push(obj);
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }

    /**
     * This method reads all Notifications belongs to specific certifier stored in Ledger.
     * @param {ctx} ctx - Request Context
     * @param {string} certifierId - Certifier Id
     * @returns {JSON} List of Notification objects in the form of JSON
     */
    async readNotificationsByCertifierId(ctx, certifierId) {
        // Validation
        this._requireCertifiers(ctx);
        this._require(certifierId.toString(), 'Certifier Id');
        const iterator = await ctx.stub.getStateByPartialCompositeKey('notification', []);
        const allResults = [];
        let result;
        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString('utf8'));
                if (obj.certifierId === certifierId.toString()) {
                    allResults.push(obj);
                }
            }
        } while (!result.done);
        await iterator.close();
        return allResults;
    }
}

module.exports = CharcoalContract;