'use strict';

const { Contract } = require('fabric-contract-api'),
    { Invoice } = require('../Models/Invoice'),
    { Company } = require('../Models/Company');
const { Certifier } = require('../Models/Certifier');
const { Notification } = require('../Models/Notification');

class BaseContract extends Contract {
    constructor(namespace) {
        super(namespace);
    }

    _createInvoiceCompositKey(stub, invoice) {
        return stub.createCompositeKey('invoice', [`${invoice}`]);
    }

    _createCompanyCompositKey(stub, companyId) {
        return stub.createCompositeKey('company', [`${companyId}`]);
    }

    _createCertifierCompositKey(stub, certifierId) {
        return stub.createCompositeKey('certifier', [`${certifierId}`]);
    }

    _createNotificationCompositKey(stub, notificationId) {
        return stub.createCompositeKey('notification', [`${notificationId}`]);
    }

    _require(value, name) {
        if (!value) {
            throw new Error(`Parameter ${name} is missing.`);
        }
    }

    _requireCertifiedCompanies(ctx) {
        if (ctx.clientIdentity.getMSPID() !== 'CertifiedCompaniesMSP') {
            throw new Error('This chaincode function can only be called by the CertifiedCompanies');
        }
    }

    _requireCertifiers(ctx) {
        if (ctx.clientIdentity.getMSPID() !== 'CertifiersMSP') {
            throw new Error('This chaincode function can only be called by the Certifiers');
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

    async _getCompany(stub, companyId) {
        const compositKey = this._createCompanyCompositKey(stub, companyId);
        const companyBytes = await stub.getState(compositKey);
        return Company.from(companyBytes);
    }

    async _getCertifier(stub, certifierId) {
        const compositKey = this._createCertifierCompositKey(stub, certifierId);
        const certifierBytes = await stub.getState(compositKey);
        return Certifier.from(certifierBytes);
    }

    async _getNotification(stub, notificationId) {
        const compositKey = this._createNotificationCompositKey(stub, notificationId);
        const notificationBytes = await stub.getState(compositKey);
        return Notification.from(notificationBytes);
    }

    async _readAllStatesByPartialCompositKey(stub, keyIdentifier) {
        const iterator = await stub.getStateByPartialCompositeKey(keyIdentifier.toString(), []);

        const allResults = [];
        let result;

        do {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                const jsonResult = {};

                const splitCompositKey = stub.splitCompositeKey(result.value.key);
                jsonResult.key = splitCompositKey.attributes[0];
                jsonResult.value = result.value.value.buffer.toString('utf-8');

                allResults.push(jsonResult);
            }

        }
        while (!result.done);

        await iterator.close();

        return this._toBuffer(allResults);
    }

    async _doesStateExist(stub, compositeKey) {
        const savedStateBytes = await stub.getState(compositeKey);
        return !!savedStateBytes && savedStateBytes.toString().length > 0;
    }
}

module.exports = { BaseContract };