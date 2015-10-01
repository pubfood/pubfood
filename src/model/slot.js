'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');

/**
 * Slot contains a definition of a publisher ad unit.
 *
 * @class
 * @memberOf pubfood/model
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
}

Slot.prototype.width = function(w) {
    this.name = w;
    return this;
}

Slot.prototype.height = function(h) {
    this.name = h;
    return this;
}

Slot.prototype.dimension = function(w,h) {
    this.dimensions_.push([w,h]);
    return this;
}

Slot.prototype.getDimensions = function() {
    return this.dimensions_;
}

util.inherits(Slot, BaseModelObject);

module.exports = Slot;
