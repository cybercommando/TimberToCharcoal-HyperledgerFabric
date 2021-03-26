/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class InvoiceContract extends Contract {

    async createInvoice(ctx, invoice) {
        await ctx.stub.putState(JSON.parse(invoice).id.toString(), Buffer.from(invoice));
        return ctx.stub.getTxID()
    }

    async readInvoice(ctx, invoiceId) {
        const inv = await ctx.stub.getState(invoiceId);
        if (!inv || inv.length === 0 ) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        return inv.toString();
    }
}

module.exports = InvoiceContract;
