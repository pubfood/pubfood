/**
 * pubfood
 */

'use strict';

/**
 * Builds the set of [Slot]{@link pubfood#model.Slot} for a
 * publisher ad server request [AuctionProvider]{@link pubfood#provider.AuctionProvider}.
 *
 * @class
 * @memberof pubfood#assembler
 */
function RequestAssembler() {
  this.operators = [];
}

/**
 * Add a transform operator to the assembler processing pipeline.
 *
 * @param {TransformOperator} operator - function to transfomr bids
 *
 */
RequestAssembler.prototype.addOperator = function(operator) {
  this.operators.push(operator);
};

/**
 * Process bids.
 *
 * @param {Slot[]} slots - bids to process.
 * @returns {Slot[]} - processed output bids
 */
RequestAssembler.prototype.process = function(slots, params) {
  var result = slots;

  for (var i = 0; i < this.operators.length; i++) {
    result = this.operators[i].process(result, params);
  }

  return result;
};

module.exports = RequestAssembler;
