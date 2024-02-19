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
        //[Coming Soon]

        //Check Buyer Certificate Here
        //[Coming Soon]

        //Object Creation from parameters
        const inv = Invoice.from({
            invoiceId: tempInvoice.invoiceId.toString(),
            productId: tempInvoice.productId.toString(),
            volumn: tempInvoice.volumn.toString(),
            seller: tempInvoice.seller.toString(),
            buyer: tempInvoice.buyer.toString(),
            date: tempInvoice.date.toString(),
            invoiceHash: tempInvoice.invoiceHash.toString()
        }).toBuffer();

        //Inserting Record in Ledger
        await ctx.stub.putState(this._createInvoiceCompositKey(ctx.stub, tempInvoice.invoiceId.toString()), inv);
        ctx.stub.setEvent(events.InvoiceInserted, inv);
        return ctx.stub.getTxID();
    }

    async readInvoice(ctx, invoiceId) {
        const iterator = await ctx.stub.getStateByPartialCompositeKey('invoice', [`${invoiceId}`]);

        const allResults = [];
        let result;

        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const jsonResult = {};

                const splitCompositKey = ctx.stub.splitCompositeKey(result.value.key);
                jsonResult.key = splitCompositKey.attributes[0];
                jsonResult.value = result.value.value.buffer.toString('utf-8');

                allResults.push(jsonResult);
            }

        }
        while (!result.done);

        await iterator.close();

        return this._toBuffer(allResults).toString();
        // if (!inv || inv.length === 0) {
        //     throw new Error(`The invoice ${invoiceId} does not exist`);
        // }
        // return inv.toString();
    }

    async readAllInvoices(ctx) {
        return await this._readAllStatesByPartialCompositKey(ctx.stub, 'invoice');
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
        const comp = Company.from({
            companyId: tempCompany.companyId.toString(),
            name: tempCompany.name.toString(),
            status: tempCompany.status.toString(),
            conversionRate: tempCompany.conversionRate.toString()
        }).toBuffer();

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

        return await this._readAllStatesByPartialCompositKey(ctx.stub, 'company');
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


    //==========================================/
    //Compare Aggregate
    //==========================================/

    extractPurchasedVolumes(ctx, invoice) {
        return 'extractPurchasedVolumes: Not Implemented Yet';
    }

    calculateAggregateVolume(ctx, invoice) {
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
