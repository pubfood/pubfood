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

Bid.prototype.value = function(v) {
  this.value = v || '';
  this.type = util.asType(this.value);
  return this;
};

Bid.prototype.slot = function(s) {
  this.slot = s;
  return this;
};

Bid.prototype.dimension = function(w, h) {
  var width = isNaN(width = parseInt(w)) ? 0 : width;
  var height  = isNaN(height = parseInt(h)) ? 0 : height;

  this.dimensions_.push([width, height]);

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
