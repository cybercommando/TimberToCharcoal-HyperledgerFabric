'use strict';

class Invoice {
    constructor() {
        this.invoiceId = '';
        this.productId = '';
        this.productLotNo = '';
        this.volumn = '';
        this.seller = '';
        this.buyer = '';
        this.date = '';
        this.invoiceHash = '';
    }

    static from(bufferOrJson) {
        if (Buffer.isBuffer(bufferOrJson)) {
            if (!bufferOrJson.length) {
                return;
            }
            bufferOrJson = JSON.parse(bufferOrJson.toString('utf-8'));

        }
        return Object.assign(new Invoice(), bufferOrJson);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }
}

module.exports = { Invoice };