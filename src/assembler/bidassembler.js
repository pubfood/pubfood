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

/**
 * Add a transform operator to the assembler processing pipeline.
 *
 * @param {function} transformFunc - function to transfomr bids
 *
 */
BidAssembler.prototype.addOperator = function(transformOperator) {
  this.operators.push(transformOperator);
};

/**
 * Process bids.
 *
 * @param {BidObject[]} bids - bids to process.
 * @returns {BidObject[]} - processed output bids
 */
BidAssembler.prototype.process = function(bids, params) {
  var result = bids;

  for (var i = 0; i < this.operators.length; i++) {
    result = this.operators[i].process(result, params);
  }

  return result;
};

module.exports = BidAssembler;
