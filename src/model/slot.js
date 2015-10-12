/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

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
  this.elementId = '';
  this.bidProviders = [];
  this.sizes = [];
}

/**
 * @typedef {array} dimensions
 * @property {number|string} width
 * @property {number|string} height
 *
 * @example
 * var dimensions = [ [300, 250], [300, 600] ];
 */

var slotConfig = require('../interfaces').SlotConfig;

/**
 * Validate a slot configuration object.
 *
 * @param {SlotConfig} config slot configuration object
 * @param {string} config.name name of the slot/ad unit in [AuctionProvider]{@link pubfood/provider.AuctionProvider} system
 * @param {string} [config.elementId] DOM target element id
 * @param {dimensions} config.sizes array of slot size dimensions
 * @param {object[]} config.bidProviders
 * @param {string} config.bidProviders.provider bid provider name
 * @param {string} [config.bidProviders.slot] external provider system slot name
 */
Slot.validate = function(config) {
  if (!config) return false;

  var err = 0;
  for (var k in slotConfig) {
    if (!config.hasOwnProperty(k) || util.asType(config[k]) !== util.asType(slotConfig[k])) {
      err++;
    }
    if (k === 'name' && !config[k]) err++;
    if (err > 0) break;
  }
  return !err;
};

/**
 * Create a new [Slot]{@link pubfood/model.Slot} from an object.
 *
 * @param {object} config slot object literal
 * @returns {object} instance of [Slot]{@link pubfood/model.Slot}. <strong><em>null</em></strong> if invalid.
 */
Slot.fromObject = function(config) {
  if (!Slot.validate(config)) return null;
  var s = new Slot();

  for (var k in config) {
    s[k] = config[k];
  }
  return s;
};

/**
 * Set the slot name.
 *
 * @param {string} name the slot name
 * @returns {pubfood/model.Slot}
 */
Slot.prototype.name = function(name) {
  this.name = name;
  return this;
};

/**
 * Set target DOM elementId.
 *
 * @param {string} elementId the target element Id
 * @returns {pubfood/model.Slot}
 */
Slot.prototype.targetId = function(elementId) {
  this.elementId = elementId;
  return this;
};

/**
 * Sets the slot's size/s
 *
 * @param {array.<number, number>} slotSizes
 * @param {number} slotSizes.0 width
 * @param {number} slotSizes.1 height
 * @returns {pubfood/model.Slot}
 *
 * @example
 * slot.sizes([ [300, 250], [300, 600] ]);
 */
Slot.prototype.addSizes = function(slotSizes) {
  Array.prototype.push.apply(this.sizes, slotSizes);
  return this;
};

/*jslint bitwise: true */

/**
 * Add a size dimension.
 *
 * @param {string|integer} width the width dimension
 * @param {string|integer} height the height dimension
 * @returns {pubfood/model.Slot}
 */
Slot.prototype.addSize = function(width, height) {
  var w = Math.abs(~~width);
  var h  = Math.abs(~~height);

  this.sizes.push([w, h]);
  return this;
};
/*jslint bitwise: false */

/**
 * Add bid provider allocated to the slot.
 *
 * @param {object} bidProvider
 * @param {string} bidProvider.provider The bid provider's name
 * @param {string} bidProvider.slot The slot name
 * @returns {pubfood/model.Slot}
 */
Slot.prototype.addBidProvider = function(slotBidProvider) {
  this.bidProviders.push(slotBidProvider);
  return this;
};

util.extends(Slot, BaseModelObject);

module.exports = Slot;
