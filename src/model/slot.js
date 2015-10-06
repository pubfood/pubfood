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
  if (this.init) {
    this.init();
  }
  this.dimensions_ = [];
}

Slot.prototype.name = function(n) {
  this.name = n;
  return this;
};

Slot.prototype.dimension = function(w, h) {
  var width = parseInt(w) || 0;
  var height = parseInt(h) || 0;
  this.dimensions_.push([width, height]);
  return this;
};

Slot.prototype.getDimensions = function() {
  return this.dimensions_;
};

util.inherits(Slot, BaseModelObject);

module.exports = Slot;
