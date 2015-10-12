/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');

/**
 * Bid is the result of a partner [BidProvider]{@link pubfood/provider.BidProvider} request.
 *
 * @class
 * @memberof pubfood/model
 */
function Bid() {
  if (this.init_) {
    this.init_();
  }
  this.sizes = [];
}

/**
 * Create a new [Bid]{@link pubfood/model.Bid} from an object.
 *
 * @param {object} config bid object literal
 * @returns {pubfood/model.Bid} instance of [Bid]{@link pubfood/model.Bid}
 */
Bid.fromObject = function(config) {

};

/**
 * Sets the bid value
 * @param {string|number} v
 * @return {pubfood/model.Bid}
 */
Bid.prototype.value = function(v) {
  this.value = v || '';
  this.type = util.asType(this.value);
  return this;
};

/**
 * Set the bid's slot
 * @param {pubfood/model.Slot} s
 * @return {pubfood/model.Bid}
 */
Bid.prototype.slot = function(s) {
  this.slot = s;
  return this;
};

/*jslint bitwise: true */
/**
 * Set's the ad
 * @param {string|number} w
 * @param {string|number} h
 * @return {pubfood/model.Bid}
 */
Bid.prototype.addSize = function(w, h) {
  var width = Math.abs(~~w);
  var height  = Math.abs(~~h);

  this.sizes.push([width, height]);

  return this;
};
/*jslint bitwise: false */

/**
 * Sets the bid's provider
 * @param {pubfood/provider.BidProvider} p
 * @return {pubfood/model.Bid}
 */
Bid.prototype.provider = function(p) {
  this.provider = p;
  return this;
};

util.extends(Bid, BaseModelObject);

module.exports = Bid;
