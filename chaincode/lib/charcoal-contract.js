/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

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
    async registerCompany(ctx, company) {
        const tempCompany = JSON.parse(company);

        //Validation
        this._requireCertifiers(ctx);
        this._require(tempCompany.companyId.toString(), 'Company Id');
        this._require(tempCompany.name.toString(), 'Company Name');
        this._require(tempCompany.status.toString(), 'Company Status');
        this._require(tempCompany.conversionRate.toString(), 'Conversion Rate');

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

    async readCompanyStatusHistory(ctx, companyId) {

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
                    //Compare Aggregate
                    //==========================================/

                    //ExtractPurchasedVolumes
                    let purchasedVolumn = invoice.volumn;

                    //CalculateAggregateVolume
                    const seller = await this.readCompany(ctx, invoice.seller);
                    let aggregatedVolumn = (seller.conversionRate / 100) * prevVolumn;
                    if (purchasedVolumn > aggregatedVolumn) {
                        FinalResult.push(invoice);
                    }
                    prevVolumn = invoice.volumn;
                }
                //FinalResult.push(invoice);
            }



            //==========================================/
            //Conversion Rate
            //==========================================/

            //calculateImplicitConversionRate

            //ExtractHistoricConversionRate

            //CompareConversionRate


            //==========================================/
            //Comparison
            //==========================================/

            //CompareResult
        }
        return FinalResult;
    }

    extractPurchasedVolumes(invoice) {
        return 'extractPurchasedVolumes: Not Implemented Yet';
    }

    calculateAggregateVolume(invoice) {
        return 'calculateAggregateVolume: Not Implemented Yet';
    }


    //==========================================/
    //Conversion Rate
    //==========================================/

    calculateImplicitCR(ctx) {
        return 'calculateImplicitCR: Not Implemented Yet';
    }

    extractHistoricCR(ctx) {
        return 'extractHistoricCR: Not Implemented Yet';
    }

    CompareCR(ctx) {
        return 'CompareCR: Not Implemented Yet';
    }


    //==========================================/
    //Comparison
    //==========================================/

    compareResults(ctx, AggVolume, CR) {
        return 'compareResults: Not Implemented Yet';
    }
}

module.exports = CharcoalContract;
