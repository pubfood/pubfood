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
  if (this.init) {
    this.init();
  }
  this.dimensions_ = [];
}

Bid.prototype.type = function(t) {
  this.type = t;
  return this;
};

Bid.prototype.value = function(v) {
  this.value = v;
  return this;
};

Bid.prototype.slot = function(s) {
  this.slot = s;
  return this;
};

Bid.prototype.dimension = function(w, h) {
  this.dimensions_.push([w, h]);
  return this;
};

Bid.prototype.getDimensions = function() {
  return this.dimensions_;
};

Bid.prototype.provider = function(p) {
  this.provider = p;
  return this;
};

util.inherits(Bid, BaseModelObject);

module.exports = Bid;
