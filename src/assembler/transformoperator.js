/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var Event = require('../event');
var transformDelegate = require('../interfaces').TransformDelegate;

/**
 * @typedef {TransformOperator} TransformOperator [TransformOperator]{@link pubfood#assembler.TransformOperator}
 */

/**
 * TransformOperator processes input bids and outputs rusult bids.
 *
 * @class
 * @param {TransformDelegate} delegate - function to transform input bids
 * @memberof pubfood#assembler
 */
function TransformOperator(delegate) {
  this.name = '';
  this.transform = delegate;
}

/**
 * Validate the operator delegate.
 *
 * @param {TransformDelegate} delegate the operator delegate function
 * @return {boolean}
 */
TransformOperator.validate = function(delegate) {
  return !!delegate &&  util.asType(delegate) === 'function';
};

/**
 * Create a new TransformOperator with delegate.
 *
 * @param {TransformDelegate} delegate transform object
 * @return {boolean}
 */
TransformOperator.withDelegate = function(delegate) {
  if (!TransformOperator.validate(delegate)) return null;

  var t = new TransformOperator(delegate);
  t.setName('OP-' + util.newId());
  return t;
};

/**
 * Set the operator name.
 *
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
