'use strict';

/**
 * Class representing Certifier Entity
 * @class
 */
class Notification {
    /**
     * @constructor
     */
    constructor() {
        this.notificationId = '';
        this.certifierId = '';
        this.certifiedCompanyId = '';
        this.notificationType = '';
        this.comments = '';
        this.status = '';
        this.newConversionRate = '';
    }

    /**
     * @function
     * @param {string} bufferOrJson - Parameter can hold buffer or JSON type value
     * @returns {Notification} Notification Object
     */
    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));

        }
        return Object.assign(new Notification(), bufferOrJson);
    }

    /**
     * @function
     * @returns {Buffer} Converts the current instance of object to Buffer value.
     */
    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Notification };