'use strict';

class Notification {
    constructor() {
        this.notificationId = '';
        this.certifierId = '';
        this.certifiedCompanyId = '';
        this.notificationType = '';
        this.comments = '';
        this.status = '';
        this.newConversionRate = '';
    }

    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));

        }
        return Object.assign(new Notification(), bufferOrJson);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Notification };