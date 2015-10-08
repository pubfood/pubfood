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
  this.dimensions_ = [];
}

Bid.prototype.value = function(v) {
  this.value = v || '';
  this.type = util.asType(this.value);
  return this;
};

Bid.prototype.slot = function(s) {
  this.slot = s;
  return this;
};

/*jslint bitwise: true */
Bid.prototype.dimension = function(w, h) {
  var width = Math.abs(~~w);
  var height  = Math.abs(~~h);

  this.dimensions_.push([width, height]);

  return this;

};
/*jslint bitwise: false */

Bid.prototype.getDimensions = function() {
  return this.dimensions_;
};

Bid.prototype.provider = function(p) {
  this.provider = p;
  return this;
};

util.extends(Bid, BaseModelObject);

module.exports = Bid;
