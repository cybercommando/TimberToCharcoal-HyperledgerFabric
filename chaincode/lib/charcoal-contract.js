/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Certifier } = require('./Models/Certifier');
const { BaseContract } = require('./Services/base-contract'),
    { Invoice } = require('./Models/Invoice'),
    { Company } = require('./Models/Company'),
    events = require('./Services/events');

class CharcoalContract extends BaseContract {
    constructor() {
        super('com.timbertocharcoal.charcoalcontract');
    }

    //==========================================/
    //Invoice Registration
    //==========================================/

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
        }
        else {
            throw new Error(`Error: The provided Seller having ID: ${tempInvoice.seller}, is not registered.`);
        }


        //Check Buyer Certificate Here
        if (await this._doesStateExist(ctx.stub, this._createCompanyCompositKey(ctx.stub, tempInvoice.buyer.toString()))) {
            const buyerInstance = await this._getCompany(ctx.stub, tempInvoice.buyer.toString());
            if (buyerInstance.status !== 'ACTIVE') {
                throw new Error(`Error: The Buyer having ID: ${tempInvoice.buyer}, doesn't have ACTIVE Certification Status`);
            }
        }
        else {
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
        }
        else {
            //Object Creation from parameters
            const inv = Invoice.from(tempInvoice).toBuffer();

            //Inserting Record in Ledger
            await ctx.stub.putState(this._createInvoiceCompositKey(ctx.stub, tempInvoice.invoiceId.toString()), inv);
            ctx.stub.setEvent(events.InvoiceInserted, inv);
        }
        return ctx.stub.getTxID();
    }

    async readInvoice(ctx, invoiceId) {
        //Validation
        this._require(invoiceId.toString(), 'Invoice Id');

        return await this._getInvoice(ctx.stub, invoiceId.toString());
    }

    async readInvoiceHistory(ctx, invoiceId) {

        //Validation
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
        }
        while (!result.done);

        await iterator.close();
        return allResults;
    }

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
        }
        while (!result.done);
        await iterator.close();
        return allResults;
    }


    //==========================================/
    //Certification
    //==========================================/
    //Certified Companies
    //------------------------------------------/
    async registerCompany(ctx, company) {
        const tempCompany = JSON.parse(company);

        //Validation
        this._requireCertifiers(ctx);
        this._require(tempCompany.companyId.toString(), 'Company Id');
        this._require(tempCompany.name.toString(), 'Company Name');
        this._require(tempCompany.status.toString(), 'Company Status');
        this._require(tempCompany.conversionRate.toString(), 'Conversion Rate');
        this._require(tempCompany.certifier.toString(), 'Certifier');

        //Object Creation from parameters
        const comp = Company.from(tempCompany).toBuffer();

        //Inserting Record in Ledger
        await ctx.stub.putState(this._createCompanyCompositKey(ctx.stub, tempCompany.companyId.toString()), comp);
        ctx.stub.setEvent(events.CompanyInserted, comp);
        return ctx.stub.getTxID();
    }

    async readCompany(ctx, companyId) {
        //Validation
        this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');

        return await this._getCompany(ctx.stub, companyId.toString());
    }

    async readCompanyHistoricConversionRate(ctx, companyId) {

        //Validation
        this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');

        let counter = 0;
        let historicConversionRate = 0;

        let companyHistory = await this.readCompanyHistory(ctx, companyId);
        for (let i = 0; i < companyHistory.length; i++) {
            counter++;
            historicConversionRate += companyHistory[i].conversionRate;
        }

        return historicConversionRate / counter;
    }

    async readAllCompanies(ctx) {
        //Validation
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
        }
        while (!result.done);
        await iterator.close();
        return allResults;
    }

    async changeStatus(ctx, companyId, status) {
        //Validation
        this._requireCertifiers(ctx);
        this._require(companyId.toString(), 'Company Id');
        this._require(status.toString(), 'Status');

        if (status.toString() === 'ACTIVE' || status.toString() === 'SUSPENDED') {
            const companyInstance = await this._getCompany(ctx.stub, companyId);

            companyInstance.status = status;

            await ctx.stub.putState(this._createCompanyCompositKey(ctx.stub, companyId), companyInstance.toBuffer());

            ctx.stub.setEvent(events.CompanyStatusChanged, companyInstance.toBuffer());

            return ctx.stub.getTxID();
        }
        else {
            throw new Error(`Error: The provided Status: ${status}, is not valid`);
        }
    }

    async readCompanyHistory(ctx, companyId) {

        //Validation
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
        }
        while (!result.done);

        await iterator.close();
        return allResults;
    }

    //------------------------------------------/
    //Certifier
    //------------------------------------------/
    async registerCertifier(ctx, certifier) {
        const tempCertifier = JSON.parse(certifier);

        //Validation
        this._requireCertifiers(ctx);
        this._require(tempCertifier.certifierId.toString(), 'Certifier Id');
        this._require(tempCertifier.certifierName.toString(), 'Certifier Name');
        this._require(tempCertifier.status.toString(), 'Certifier Status');

        //Object Creation from parameters
        const crt = Certifier.from(tempCertifier).toBuffer();

        //Inserting Record in Ledger
        await ctx.stub.putState(this._createCertifierCompositKey(ctx.stub, tempCertifier.certifierId.toString()), crt);
        ctx.stub.setEvent(events.CertifierInserted, crt);
        return ctx.stub.getTxID();
    }

    async readCertifier(ctx, certifierId) {
        //Validation
        this._requireCertifiers(ctx);
        this._require(certifierId.toString(), 'Certifier Id');

        return await this._getCertifier(ctx.stub, certifierId.toString());
    }

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

    async changeCertifierStatus(ctx, certifierId, status) {
        //Validation
        this._requireCertifiers(ctx);
        this._require(certifierId.toString(), 'Certifier Id');
        this._require(status.toString(), 'Status');

        if (status.toString() === 'ACTIVE' || status.toString() === 'INACTIVE') {
            const certifierInstance = await this._getCertifier(ctx.stub, certifierId);

            certifierInstance.status = status;

            await ctx.stub.putState(this._createCertifierCompositKey(ctx.stub, certifierId), certifierInstance.toBuffer());

            ctx.stub.setEvent(events.CertifierStatusChanged, certifierInstance.toBuffer());

            return ctx.stub.getTxID();
        }
        else {
            throw new Error(`Error: The provided Status: ${status}, is not valid`);
        }
    }

    //==========================================/
    //Audit
    //==========================================/

    async PerformAudit(ctx) {
        let FinalResult = [];
        //Validation
        this._requireCertifiers(ctx);

        let Invoices = await this.readAllInvoices(ctx);
        for (let i = 0; i < Invoices.length; i++) {
            let InvoiceHistory = await this.readInvoiceHistory(ctx, Invoices[i].invoiceId);

            //Holding Previous Invoice Volumn
            let prevVolumn = 0;
            for (let j = 0; j < InvoiceHistory.length; j++) {
                const invoice = InvoiceHistory[j];
                if (j === 0) {
                    prevVolumn = invoice.volumn;
                }
                else {
                    //==========================================/
                    //Compare Aggregate Volumns
                    //==========================================/
                    let AggregateComparisonResult = await this.CompareAggregateVolumes(ctx, prevVolumn, invoice);

                    //==========================================/
                    //Conversion Rate
                    //==========================================/
                    let ConversionRateComparisonResult = await this.CompareConversionRate(ctx, prevVolumn, invoice);

                    //==========================================/
                    //Comparison
                    //==========================================/
                    let result = await this.ProcessComparisonResults(ctx, AggregateComparisonResult, ConversionRateComparisonResult);
                    if (result) {
                        FinalResult.push(invoice);
                    }
                    prevVolumn = invoice.volumn;
                }
                //FinalResult.push(invoice);
            }
        }
        return FinalResult;
    }

    //==========================================/
    //Compare Aggregate Volumns
    //==========================================/
    async CompareAggregateVolumes(ctx, prevVolumn, invoice) {
        //ExtractPurchasedVolumes
        let purchasedVolumn = invoice.volumn;

        //CalculateAggregateVolume
        const seller = await this.readCompany(ctx, invoice.seller);
        let aggregatedVolumn = (seller.conversionRate / 100) * prevVolumn;
        if (purchasedVolumn > aggregatedVolumn) {
            return true;
        }
        return false;
    }

    //==========================================/
    //Compare Conversion Rate
    //==========================================/
    async CompareConversionRate(ctx, prevVolumn, invoice) {
        //calculateImplicitConversionRate
        let implicitCR = (invoice.volumn / prevVolumn) * 100;

        //ExtractHistoricConversionRate
        let historicCR = await this.readCompanyHistoricConversionRate(ctx, invoice.seller);

        //DeviationCheck
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
    //Process Comparison Results
    //==========================================/

    async ProcessComparisonResults(ctx, AggVolume, CR) {
        if (AggVolume || CR) {
            return true;
        }
        return false;
    }
}

module.exports = CharcoalContract;
