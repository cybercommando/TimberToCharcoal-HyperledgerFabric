'use strict';

module.exports = {
    CompanyData: [
        {
            companyId: 'CC001',
            name: 'Company 001 - Producer',
            status: 'ACTIVE',
            conversionRate: '100'
        },
        {
            companyId: 'CC002',
            name: 'Company 002 - Producer',
            status: 'ACTIVE',
            conversionRate: '100'
        },
        {
            companyId: 'CC003',
            name: 'Company 003 - Producer',
            status: 'ACTIVE',
            conversionRate: '100'
        },
        {
            companyId: 'CC004',
            name: 'Company 004 - Producer',
            status: 'SUSPENDED',
            conversionRate: '100'
        },
        {
            companyId: 'CC005',
            name: 'Company 005 - Charcoal Processor',
            status: 'ACTIVE',
            conversionRate: '20'
        },
        {
            companyId: 'CC006',
            name: 'Company 006 - Charcoal Processor',
            status: 'ACTIVE',
            conversionRate: '20'
        },
        {
            companyId: 'CC007',
            name: 'Company 007 - Charcoal Processor',
            status: 'SUSPENDED',
            conversionRate: '15'
        },
        {
            companyId: 'CC008',
            name: 'Company 008 - Secondary Charcoal Processor',
            status: 'ACTIVE',
            conversionRate: '80'
        },
        {
            companyId: 'CC009',
            name: 'Company 009 - Secondary Charcoal Processor',
            status: 'ACTIVE',
            conversionRate: '80'
        },
        {
            companyId: 'CC010',
            name: 'Company 010 - Secondary Charcoal Processor',
            status: 'ACTIVE',
            conversionRate: '80'
        },
        {
            companyId: 'CC011',
            name: 'Company 011 - Secondary Charcoal Processor',
            status: 'SUSPENDED',
            conversionRate: '65'
        },
        {
            companyId: 'CC012',
            name: 'Company 012 - Broker',
            status: 'ACTIVE',
            conversionRate: '100'
        },
        {
            companyId: 'CC013',
            name: 'Company 013 - Broker',
            status: 'ACTIVE',
            conversionRate: '100'
        },
        {
            companyId: 'CC014',
            name: 'Company 014 - Broker',
            status: 'ACTIVE',
            conversionRate: '100'
        },
        {
            companyId: 'CC015',
            name: 'Company 015 - Retailer',
            status: 'ACTIVE',
            conversionRate: '100'
        }
    ],
    InvoiceData: [
        {
            productLotNo: 'LOT0100',
            invoiceId: 'INV011',
            productId: 'Timber Wood',
            volumn: '1000',
            seller: 'CC001',
            buyer: 'CC005',
            date: '1/4/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0100',
            invoiceId: 'INV013',
            productId: 'Charcoal Package 1',
            volumn: '200',
            seller: 'CC005',
            buyer: 'CC008',
            date: '1/5/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0100',
            invoiceId: 'INV015',
            productId: 'Charcoal Package 2',
            volumn: '160',
            seller: 'CC008',
            buyer: 'CC014',
            date: '1/5/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0100',
            invoiceId: 'INV016',
            productId: 'Charcoal Package 2',
            volumn: '160',
            seller: 'CC014',
            buyer: 'CC015',
            date: '1/8/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0200',
            invoiceId: 'INV021',
            productId: 'Timber Wood',
            volumn: '1000',
            seller: 'CC001',
            buyer: 'CC005',
            date: '1/12/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0200',
            invoiceId: 'INV023',
            productId: 'Charcoal Package 1',
            volumn: '200',
            seller: 'CC005',
            buyer: 'CC008',
            date: '1/13/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0200',
            invoiceId: 'INV025',
            productId: 'Charcoal Package 2',
            volumn: '160',
            seller: 'CC008',
            buyer: 'CC015',
            date: '1/15/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0300',
            invoiceId: 'INV031',
            productId: 'Timber Wood',
            volumn: '1000',
            seller: 'CC001',
            buyer: 'CC006',
            date: '1/18/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0300',
            invoiceId: 'INV033',
            productId: 'Charcoal Package 1',
            volumn: '200',
            seller: 'CC006',
            buyer: 'CC013',
            date: '1/19/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0300',
            invoiceId: 'INV034',
            productId: 'Charcoal Package 1',
            volumn: '200',
            seller: 'CC013',
            buyer: 'CC009',
            date: '1/19/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0300',
            invoiceId: 'INV035',
            productId: 'Charcoal Package 2',
            volumn: '160',
            seller: 'CC009',
            buyer: 'CC015',
            date: '1/20/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0400',
            invoiceId: 'INV041',
            productId: 'Timber Wood',
            volumn: '1000',
            seller: 'CC002',
            buyer: 'CC006',
            date: '1/25/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0400',
            invoiceId: 'INV043',
            productId: 'Charcoal Package 1',
            volumn: '200',
            seller: 'CC006',
            buyer: 'CC008',
            date: '1/26/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0400',
            invoiceId: 'INV045',
            productId: 'Charcoal Package 2',
            volumn: '160',
            seller: 'CC008',
            buyer: 'CC015',
            date: '1/27/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0500',
            invoiceId: 'INV051',
            productId: 'Timber Wood',
            volumn: '500',
            seller: 'CC002',
            buyer: 'CC012',
            date: '2/1/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0500',
            invoiceId: 'INV052',
            productId: 'Timber Wood',
            volumn: '500',
            seller: 'CC012',
            buyer: 'CC006',
            date: '2/2/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0500',
            invoiceId: 'INV053',
            productId: 'Charcoal Package 1',
            volumn: '100',
            seller: 'CC006',
            buyer: 'CC009',
            date: '2/11/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0500',
            invoiceId: 'INV055',
            productId: 'Charcoal Package 2',
            volumn: '80',
            seller: 'CC009',
            buyer: 'CC015',
            date: '2/12/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0600',
            invoiceId: 'INV061',
            productId: 'Timber Wood',
            volumn: '500',
            seller: 'CC002',
            buyer: 'CC005',
            date: '2/18/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0600',
            invoiceId: 'INV063',
            productId: 'Charcoal Package 1',
            volumn: '100',
            seller: 'CC005',
            buyer: 'CC008',
            date: '2/22/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0600',
            invoiceId: 'INV065',
            productId: 'Charcoal Package 2',
            volumn: '80',
            seller: 'CC008',
            buyer: 'CC015',
            date: '3/2/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0700',
            invoiceId: 'INV071',
            productId: 'Timber Wood',
            volumn: '500',
            seller: 'CC003',
            buyer: 'CC006',
            date: '3/2/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0700',
            invoiceId: 'INV073',
            productId: 'Charcoal Package 1',
            volumn: '100',
            seller: 'CC006',
            buyer: 'CC009',
            date: '3/10/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0700',
            invoiceId: 'INV075',
            productId: 'Charcoal Package 2',
            volumn: '80',
            seller: 'CC009',
            buyer: 'CC015',
            date: '3/12/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0800',
            invoiceId: 'INV081',
            productId: 'Timber Wood',
            volumn: '500',
            seller: 'CC003',
            buyer: 'CC005',
            date: '3/18/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0800',
            invoiceId: 'INV083',
            productId: 'Charcoal Package 1',
            volumn: '100',
            seller: 'CC005',
            buyer: 'CC010',
            date: '3/18/21',
            invoiceHash: 'Sample Hash'
        },
        {
            productLotNo: 'LOT0800',
            invoiceId: 'INV085',
            productId: 'Charcoal Package 2',
            volumn: '65',
            seller: 'CC010',
            buyer: 'CC015',
            date: '3/19/21',
            invoiceHash: 'Sample Hash'
        }
    ]
};