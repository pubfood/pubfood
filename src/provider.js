'use strict';

/**
 * Providers live here..
 * @namespace pubfood/provider
 */

var AuctionProvider = require('./provider/auctionprovider');
var CreativeProvider = require('./provider/creativeprovider');
var BidProvider = require('./provider/bidprovider');

/**
 * Coordinates and orchestrats Provider instances.
 *
 * @module
 * @memberof pubfood
 */
var provider = {
  buildBidProvider: function(config) {
    return new BidProvider(config);
  }
};

module.exports = provider;
