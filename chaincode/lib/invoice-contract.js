/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class InvoiceContract extends Contract {

    async invoiceExists(ctx, invoiceId) {
        const buffer = await ctx.stub.getState(invoiceId);
        return (!!buffer && buffer.length > 0);
    }

    async createInvoice(ctx, invoiceId, value) {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (exists) {
            throw new Error(`The invoice ${invoiceId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(invoiceId, buffer);
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

    async updateInvoice(ctx, invoiceId, newValue) {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (!exists) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(invoiceId, buffer);
    }

    async deleteInvoice(ctx, invoiceId) {
        const exists = await this.invoiceExists(ctx, invoiceId);
        if (!exists) {
            throw new Error(`The invoice ${invoiceId} does not exist`);
        }
        await ctx.stub.deleteState(invoiceId);
    }

}

module.exports = InvoiceContract;
