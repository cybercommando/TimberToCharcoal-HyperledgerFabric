'use strict';

const { Contract } = require('fabric-contract-api'),
    { Invoice } = require('../Models/Invoice');

class BaseContract extends Contract {
    constructor(namespace) {
        super(namespace);
    }

    _createInvoiceCompositKey(stub, invoice) {
        return stub.createCompositeKey('invoice', [`${invoice}`]);
    }

    _require(value, name) {
        if (!value) {
            throw new Error(`Parameter ${name} is missing.`);
        }
    }

    _toBuffer(obj) {
        return Buffer.from(JSON.stringify(obj));
    }

    _fromBuffer(buffer) {
        if (Buffer.isBuffer(buffer)) {
            if (!buffer.length) {
                return;
            }
            return JSON.parse(buffer.toString('utf-8'));
        }
    }

    async _getInvoice(stub, invoice) {
        const compositKey = this._createInvoiceCompositKey(stub, invoice);
        const invoiceBytes = await stub.getState(compositKey);
        return Invoice.from(invoiceBytes);
    }
}

module.exports = { BaseContract };