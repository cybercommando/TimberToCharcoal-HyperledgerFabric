'use strict';

class Certifier {
    constructor() {
        this.certifierId = '';
        this.certifierName = '';
        this.status = '';
    }

    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));

        }
        return Object.assign(new Certifier(), bufferOrJson);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Certifier };