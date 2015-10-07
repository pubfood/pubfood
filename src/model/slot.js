'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');

/**
 * Slot contains a definition of a publisher ad unit.
 *
 * @class
 * @memberof pubfood/model
 */
function Slot() {
  if (this.init_) {
    this.init_();
  }
  this.dimensions_ = [];
}

Slot.prototype.name = function(n) {
  this.name = n;
  return this;
};

Slot.prototype.dimension = function(w, h) {
  var width = isNaN(width = parseInt(w)) ? 0 : width;
  var height  = isNaN(height = parseInt(h)) ? 0 : height;

  this.dimensions_.push([width, height]);
  return this;
};

Slot.prototype.getDimensions = function() {
  return this.dimensions_;
};

util.extends(Slot, BaseModelObject);

module.exports = Slot;
