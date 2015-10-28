/**
 * pubfood
 */

'use strict';

/**
 * Builds the set of [Bids]{@link pubfood#model.Bid} for a
 * publisher ad server request [AuctionProvider]{@link pubfood#provider.AuctionProvider}.
 *
 * @class
 * @param {AuctionMediator} - bidder and publisher request coordination
 * @memberof pubfood#assembler
 */
function BidAssembler(auctionMediator) {
  this.auctionMediator = auctionMediator;
  this.operators = [];
}

/**
 * Add a transform operator to the assembler processing pipeline.
 *
 * @param {TransformOperator} operator - function to transfomr bids
 *
 */
BidAssembler.prototype.addOperator = function(operator) {
  this.operators.push(operator);
};

/**
 * Process bids.
 *
 * @param {Bid[]} bids - bids to process.
 * @returns {Bid[]} - processed output bids
 */
BidAssembler.prototype.process = function(bids, params) {
  var result = bids;

  for (var i = 0; i < this.operators.length; i++) {
    result = this.operators[i].process(result, params);
  }

  return result;
};

module.exports = BidAssembler;
