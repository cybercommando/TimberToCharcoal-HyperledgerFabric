/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { BaseContract } = require('./Models/base-contract'),
    { Invoice } = require('./Models/Invoice'),
    events = require('./Models/events');

class InvoiceContract extends BaseContract {
    constructor() {
        super('com.timbertocharcoal.invoicecontract');
    }

    async createInvoice(ctx, invoice) {
        const tempInvoice = JSON.parse(invoice);
        console.log(invoice);
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

    _requireCertifiedCompanies(ctx) {
        if (ctx.clientIdentity.getMSPID() !== 'CertifiedCompaniesMSP') {
            throw new Error('This chaincode function can only be called by the CertifiedCompanies');
        }
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
}

module.exports = InvoiceContract;
