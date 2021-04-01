'use strict';

class Company {
    constructor() {
        this.companyId = '';
        this.name = '';
        this.status = '';
        this.conversionRate = '';
    }

    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));

        }
        return Object.assign(new Company(), bufferOrJson);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Company };