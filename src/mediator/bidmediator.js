/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

var util = require('../util');
var BidProvider = require('../provider/bidprovider');

/**
 * BidMediator mediates provider bid requests.
 *
 * @class
 * @memberof pubfood/mediator
 */
function BidMediator() {
}

/**
 * Add a [BidProvider]{@link pubfood/provider.BidProvider} objects.
 *
 * @param {object[]} bidProviders - [BidProviders]{@link pubfood/provider.BidProvider} to mediate
 */
BidMediator.prototype.addBidProviders = function(bidProviders) {
  if (!bidProviders) return this;

  if (this.bidProviders) {
    delete this.bidProviders;
  }
  this.bidProviders = {};

  for (var i = 0; i < bidProviders.length; i++) {
    var provider = bidProviders[i];
    this.bidProviders[provider.name] = provider;
  }
  return this;
};


BidMediator.prototype.loadProviders = function() {
  for (var i = 0; i < this.bidProviders.length; i++) {
    if (this.bidProviders[i].libUri) {
      var uri = this.bidProviders[i].libUri();
      util.loadUri(uri);
    }
  }
};

BidMediator.prototype.initBids = function(slots) {
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];

    //provider.init();
  }
};

BidMediator.prototype.resolveProviders = function(slots) {
  var poviderSlots = {};
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    for (var j = 0; j < slot.bidProviders.length; j++) {
      var providerName = slot.bidProviders[j];
      var bidProvider = this.bidProviders[providerName];

    }
  }
};

BidMediator.prototype.refreshBids = function(slots) {
  // resolve bidder slots
  // then for each bidder, refresh slots
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
  }
};

module.exports = BidMediator;
