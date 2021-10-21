'use strict';

const { Contract } = require('fabric-contract-api');
const { Invoice } = require('../Models/Invoice');
const { Company } = require('../Models/Company');
const { Certifier } = require('../Models/Certifier');
const { Notification } = require('../Models/Notification');

/**
 * Class which is directly extended from Contract and have generic functions which will futher use in CharcoalContract
 * @class
 */
class BaseContract extends Contract {
    /**
     * @constructor
     * @param {string} namespace - String for grouping functions within classes
     */
    constructor(namespace) {
        super(namespace);
    }

    /**
     * Function is responsible to create the composit key for Invoices
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} invoice - Invoice Id
     */
    _createInvoiceCompositKey(stub, invoice) {
        return stub.createCompositeKey('invoice', [`${invoice}`]);
    }

    /**
     * Function is responsible to create the composit key for Companies
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} companyId - Company Id
     */
    _createCompanyCompositKey(stub, companyId) {
        return stub.createCompositeKey('company', [`${companyId}`]);
    }

    /**
     * Function is responsible to create the composit key for Certifier
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} certifierId - Certifier Id
     */
    _createCertifierCompositKey(stub, certifierId) {
        return stub.createCompositeKey('certifier', [`${certifierId}`]);
    }

    /**
     * Function is responsible to create the composit key for Notification
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} notificationId - Notification Id
     */
    _createNotificationCompositKey(stub, notificationId) {
        return stub.createCompositeKey('notification', [`${notificationId}`]);
    }

    /**
     * This method is for validation, Throws exception if the value is null
     * @function
     * @param {string}  value - Any value that needs to be checked
     * @param {string} name - Name of the value
     */
    _require(value, name) {
        if (!value) {
            throw new Error(`Parameter ${name} is missing.`);
        }
    }

    /**
     * This method is for validation, Throws exception if the user of the request is not CertifiedCompany
     * @function
     * @param {ctx} ctx - Request Context
     */
    _requireCertifiedCompanies(ctx) {
        if (ctx.clientIdentity.getMSPID() !== 'CertifiedCompaniesMSP') {
            throw new Error('This chaincode function can only be called by the CertifiedCompanies');
        }
    }

    /**
     * This method is for validation, Throws exception if the user of the request is not Certifier
     * @function
     * @param {ctx} ctx - Request Context
     */
    _requireCertifiers(ctx) {
        if (ctx.clientIdentity.getMSPID() !== 'CertifiersMSP') {
            throw new Error('This chaincode function can only be called by the Certifiers');
        }
    }

    /**
     * This method converts class object to Buffer
     * @function
     * @param {Object} obj - Any class Object
     */
    _toBuffer(obj) {
        return Buffer.from(JSON.stringify(obj));
    }

    /**
     * This method converts Buffer value to JSON
     * @function
     * @param {Buffer} buffer - Buffer Value
     */
    _fromBuffer(buffer) {
        if (Buffer.isBuffer(buffer)) {
            if (!buffer.length) {
                return;
            }
            return JSON.parse(buffer.toString('utf-8'));
        }
    }

    /**
     * This method get the invoice data from ledger and return Invoice Object.
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} invoice - Invoice Id
     */
    async _getInvoice(stub, invoice) {
        const compositKey = this._createInvoiceCompositKey(stub, invoice);
        const invoiceBytes = await stub.getState(compositKey);
        return Invoice.from(invoiceBytes);
    }

    /**
     * This method get the company data from ledger and return Company Object.
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} companyId - Company Id
     */
    async _getCompany(stub, companyId) {
        const compositKey = this._createCompanyCompositKey(stub, companyId);
        const companyBytes = await stub.getState(compositKey);
        return Company.from(companyBytes);
    }

    /**
     * This method get the Certifier data from ledger and return Certifier Object.
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} certifierId - Certifier Id
     */
    async _getCertifier(stub, certifierId) {
        const compositKey = this._createCertifierCompositKey(stub, certifierId);
        const certifierBytes = await stub.getState(compositKey);
        return Certifier.from(certifierBytes);
    }

    /**
     * This method get the Notification data from ledger and return Notification Object.
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} notificationId - Notification Id
     */
    async _getNotification(stub, notificationId) {
        const compositKey = this._createNotificationCompositKey(stub, notificationId);
        const notificationBytes = await stub.getState(compositKey);
        return Notification.from(notificationBytes);
    }

    /**
     * This method returns a list of states containing the given KeyIdentifier
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} keyIdentifier - Key Identifer of the state
     */
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

    /**
     * This method confirms that whether a state is exists or not.
     * @function
     * @param {ctx.stub}  stub - Fabric api to communicate with Fabric
     * @param {string} compositeKey - Composit Key of any Entity.
     */
    async _doesStateExist(stub, compositeKey) {
        const savedStateBytes = await stub.getState(compositeKey);
        return !!savedStateBytes && savedStateBytes.toString().length > 0;
    }
}

module.exports = { BaseContract };