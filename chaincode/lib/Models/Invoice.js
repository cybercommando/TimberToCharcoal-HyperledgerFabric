'use strict';

/**
 * Class representing Invoice Entity
 * @class
 */
class Invoice {
    /**
     * @constructor
     */
    constructor() {
        this.invoiceId = '';
        this.productId = '';
        this.volumn = '';
        this.seller = '';
        this.buyer = '';
        this.date = '';
        this.invoiceHash = '';
    }
    /**
     * @function
     * @param {string} bufferOrJson - Parameter can hold buffer or JSON type value
     * @returns {Invoice} Invoice Object
     */
    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));
        }
        return Object.assign(new Invoice(), bufferOrJson);
    }

    /**
     * @function
     * @returns {Buffer} Converts the current instance of object to Buffer value.
     */
    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Invoice };