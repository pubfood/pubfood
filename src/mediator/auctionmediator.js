/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var BidMediator = require('./bidmediator');

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood/mediator
 */
function AuctionMediator(config) {
  this.config = config || {};
  this.bidMediator = null;
  this.auctionProvider = null;
}

AuctionMediator.prototype.init = function() {
  this.bidMediator = new BidMediator(this.config);
  this.bidMediator.init();
};

module.exports = AuctionMediator;
