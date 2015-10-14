/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/**
 * BidAssembler builds the set of [Bids]{@link pubfood#model.Bid} for a
 * publisher ad server request [AuctionProvider]{@link pubfood#provider.AuctionProvider}.
 *
 * @class
 * @param {object} auctionMediator - bidder and publisher request coordination
 * @memberof pubfood#assembler
 */
function BidAssembler(auctionMediator) {
  this.auctionMediator = auctionMediator;
  this.operators = [];
}

BidAssembler.prototype.process = function(bids) {
  var result = bids;

  for (var i = 0; i < this.operators.length; i++) {
    result = this.operators[i].process(result);
  }

  return result;
};

module.exports = BidAssembler;
