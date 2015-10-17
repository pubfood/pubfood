/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/**
 * TransformOperator processes input bids and outputs rusult bids.
 *
 * @class
 * @param {function} transformFunc - function to transform input bids
 * @memberof pubfood#assembler
 */
function TransformOperator(transformFunc) {
  this.transform = transformFunc;
}

/**
 * Process bids.
 *
 * @param {BidObject[]} bids - bids to process.
 * @returns {BidObject[]} - processed output bids
 */
TransformOperator.prototype.process = function(bids, params) {
  if (!bids) return null;

  var outBids = this.transform(bids, params);

  if (!outBids) {
    Event.publish(Event.EVENT_TYPE.ERROR, 'no transform output');
  }

  return outBids || null;
};

module.exports = TransformOperator;
