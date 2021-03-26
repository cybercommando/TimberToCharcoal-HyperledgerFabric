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
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (!exists) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
}

module.exports = InvoiceContract;
