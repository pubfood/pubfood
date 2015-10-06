'use strict';

/**
 * Vendor provider implementations live here.
 * @namespace pubfood/provider/vendor
 */

var YieldbotBidProvider = require('./vendor/yieldbotbidprovider');

/**
 * Container for provider vendors.
 *
 * @module
 * @memberOf pubfood/provider
 * @property {Object} bidProviers - The registered [BidProviders]{@link pubfood/provider.BidProvider}
 */
var vendor = {
    bidProviders: [YieldbotBidProvider]
};

module.exports = vendor;
