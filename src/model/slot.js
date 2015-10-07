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

/*jslint bitwise: true */
Slot.prototype.dimension = function(w, h) {
  var width = Math.abs(~~w);
  var height  = Math.abs(~~h);

  this.dimensions_.push([width, height]);
  return this;
};
/*jslint bitwise: false */

Slot.prototype.getDimensions = function() {
  return this.dimensions_;
};

util.extends(Slot, BaseModelObject);

module.exports = Slot;
