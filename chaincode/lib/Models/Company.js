'use strict';

/**
 * Class representing Company Entity
 * @class
 */
class Company {
    /**
     * @constructor
     */
    constructor() {
        this.companyId = '';
        this.name = '';
        this.status = '';
        this.conversionRate = '';
        this.certifier = '';
    }

    /**
     * @function
     * @param {string} bufferOrJson - Parameter can hold buffer or JSON type value
     * @returns {Company} Company Object
     */
    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));
        }
        return Object.assign(new Company(), bufferOrJson);
    }

    /**
     * @function
     * @returns {Buffer} Converts the current instance of object to Buffer value.
     */
    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Company };