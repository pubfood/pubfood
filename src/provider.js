/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

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
  bidProviderBuilder: function(config) {
    return new BidProvider(config);
  },
  creativeProviderBuilder: function(config) {
    return new CreativeProvider(config);
  },
  auctionProviderBuilder: function(config) {
    return new AuctionProvider(config);
  },
  fnNames: ['load', 'init', 'fetch', 'refresh']
};

module.exports = provider;
