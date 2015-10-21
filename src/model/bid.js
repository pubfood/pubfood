/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');
var BidObject = require('../interfaces').BidObject;

/**
 * @typedef {Bid} Bid [Bid]{@link pubfood#model.Bid}
 */

/**
 * Bid is the result of a partner [BidProvider]{@link pubfood/provider.BidProvider} request.
 *
 * @class
 * @memberof pubfood#model
 */
function Bid() {
  if (this.init_) {
    this.init_();
  }
  this.sizes = [];
}

/**
 * Validate the bid config
 *
 * @param {BidObject} config
 * @return {boolean}
 */
Bid.validate = function(config) {
  if (!config) return false;
  return util.validate(BidObject, config);
};

/**
 * Create a new [Bid]{@link pubfood#model.Bid} from an object.
 *
 * @param {BidObject} config bid object literal
 * @returns {pubfood#model.Bid} instance of [Bid]{@link pubfood#model.Bid}
 */
Bid.fromObject = function(config) {
  if (!Bid.validate(config)) return null;
  var b = new Bid();
  for (var k in config) {
    b[k] = config[k];
  }
  return b;
};

/**
 * Set the bid's label/name
 * @param {string} lbl
 * @return {pubfood#model.Bid}
 */
Bid.prototype.label = function(lbl) {
  this.label = lbl || '';
  return this;
};

/**
 * Sets the bid's value
 * @param {string|number} v
 * @return {pubfood#model.Bid}
 */
Bid.prototype.value = function(v) {
  this.value = v || '';
  this.type = util.asType(this.value);
  return this;
};

/**
 * Set the bid's slot
 * @param {pubfood#model.Slot} s
 * @return {pubfood#model.Bid}
 */
Bid.prototype.slot = function(s) {
  this.slot = s;
  return this;
};

/**
 * Sets the bid's slot size
 *
 * @todo maybe combine with Bid.prototype.dimensions
 *
 * @param {string|number} w
 * @param {string|number} h
 * @return {pubfood#model.Bid}
 */
Bid.prototype.addSize = function(w, h) {
  var width = Math.abs(~~w);
  var height = Math.abs(~~h);

  this.sizes.push([width, height]);
  return this;
};

/**
 * Set the sizes for the bid
 *
 * @todo maybe combine with Bid.prototype.addSize
 *
 * @param {array} szs
 * @return {pubfood#model.Bid}
 */
Bid.prototype.dimensions = function(szs) {
  this.sizes = szs || [];
  return this;
};

/**
 * Sets the bid's provider
 * @param {pubfood#provider.BidProvider} p
 * @return {pubfood#model.Bid}
 */
Bid.prototype.provider = function(p) {
  this.provider = p;
  return this;
};

/**
 * Set bid options
 * @param {object} opt Dib options
 * @return {pubfood#model.Bid}
 */
Bid.prototype.options = function(opt) {
  this.options = opt || {};
  return this;
};

util.extends(Bid, BaseModelObject);
module.exports = Bid;
