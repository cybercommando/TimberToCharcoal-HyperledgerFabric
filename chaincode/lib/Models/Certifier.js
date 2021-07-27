'use strict';

/**
 * Class representing Certifier Entity
 * @class
 */
class Certifier {
    /**
     * @constructor
     */
    constructor() {
        this.certifierId = '';
        this.certifierName = '';
        this.status = '';
    }

    /**
     * @function
     * @param {string} bufferOrJson - Parameter can hold buffer or JSON type value
     * @returns {Certifier} Certifier Object
     */
    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));
        }
        return Object.assign(new Certifier(), bufferOrJson);
    }

    /**
     * @function
     * @returns {Buffer} Converts the current instance of object to Buffer value.
     */
    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Certifier };