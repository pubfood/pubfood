/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Providers live here..
 */

'use strict';

var AuctionProvider = require('./provider/auctionprovider');
var CreativeProvider = require('./provider/creativeprovider');
var BidProvider = require('./provider/bidprovider');

/**
 * Coordinates and orchestrats Provider instances.
 * @memberof pubfood
 * @inner
 * @property {function} bidProviderBuilder
 * @property {function} creativeProviderBuilder
 * @property {function} auctionProviderBuilder
 * @property {string[]} fnNames
 */
var provider = {
  /**
   * Creates a BidProvider
   * @memberOf provider
   * @param {BidProviderConfig} config
   * @return {BidProvider}
   */
  bidProviderBuilder: function(config) {
    return new BidProvider(config);
  },
  creativeProviderBuilder: function(config) {
    return new CreativeProvider(config);
  },
  auctionProviderBuilder: function(config) {
    return new AuctionProvider(config);
  },
  /**
   * @type {string[]}
   */
  fnNames: ['load', 'init', 'fetch', 'refresh']
};

module.exports = provider;
