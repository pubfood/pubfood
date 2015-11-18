/**
 * pubfood
 */

'use strict';

var util = require('../util');
var Event = require('../event');
var PubfoodError = require('../errors');

/**
 * TransformOperator processes input bids and outputs result bids.
 *
 * @class
 * @param {TransformDelegate} delegate - function to transform input bids
 * @memberof pubfood#assembler
 */
function TransformOperator(delegate) {
  this.name = 'OP-' + util.newId();
  this.transform = delegate;
}

/**
 * Validate the operator delegate.
 *
 * @param {TransformDelegate} delegate the operator delegate function
 * @return {boolean}
 * @private
 */
TransformOperator.validate = function(delegate) {
  return !!delegate &&  util.asType(delegate) === 'function';
};

/**
 * Create a new TransformOperator with delegate.
 *
 * @param {TransformDelegate} delegate transform object
 * @return {boolean}
 * @private
 */
TransformOperator.withDelegate = function(delegate) {
  if (!TransformOperator.validate(delegate)) return null;

  var t = new TransformOperator(delegate);

  return t;
};

/**
 * Set the operator name.
 * Default name: OP-[uniqueID] e.g. OP-ih47iucugqzlerdpbr
 * @param {string} name the name of the operator
 * @return {TransformOperator}
 */
TransformOperator.prototype.setName = function(name) {
  this.name = name;
  return this;
};

/**
 * Process bids.
 *
 * @param {BidObject[]} bids - bids to process.
 * @param {object} params - parameters as required by delegate function
 * @returns {Bid[]} - processed output bids
 * @private
 */
TransformOperator.prototype.process = function(bids, params) {
  if (!bids) return null;

  var outBids = this.transform(bids, params);

  if (!outBids) {
    Event.publish(Event.EVENT_TYPE.ERROR, new PubfoodError('no transform output'));
  }

  return outBids || null;
};

module.exports = TransformOperator;
