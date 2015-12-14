/**
 * pubfood
 */

'use strict';

var util = require('../util');
var PubfoodObject = require('../pubfoodobject');
var slotConfig = require('../interfaces').SlotConfig;

/**
 * Slot contains a definition of a publisher ad unit.
 *
 * @class
 * @param {string} name the slot name
 * @param {string} elementId target DOM element id for the slot
 * @augments pubfood.PubfoodObject
 * @memberof pubfood#model
 */
function Slot(name, elementId) {
  if (this.init_) {
    this.init_();
  }
  this.name = name;
  this.elementId = elementId;
  this.bidProviders = [];
  this.sizes = [];
}

/**
 * Validate a slot configuration object.
 *
 * @param {SlotConfig} config slot configuration object
 * @return {boolean}
 * @private
 */
Slot.validate = function(config) {
  if (!config) return false;
  return util.validate(slotConfig, config);
};

/**
 * Create a new [Slot]{@link pubfood#model.Slot} from an object.
 *
 * @param {SlotConfig} config slot object literal
 * @returns {Slot|null} instance of [Slot]{@link pubfood#model.Slot}. <strong><em>null</em></strong> if invalid.
 * @private
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
 * Sets the slot's size/s
 *
 * @param {array.<number, number>} slotSizes
 * @param {number} slotSizes.0 width
 * @param {number} slotSizes.1 height
 * @returns {pubfood#model.Slot}
 *
 * @example
 * slot.sizes([ [300, 250], [300, 600] ]);
 * @private
 */
Slot.prototype.addSizes = function(slotSizes) {
  Array.prototype.push.apply(this.sizes, slotSizes);
  return this;
};

/**
 * Add a size dimension.
 *
 * @param {string|integer} width the width dimension
 * @param {string|integer} height the height dimension
 * @returns {pubfood#model.Slot}
 */
Slot.prototype.addSize = function(width, height) {
  var w = Math.abs(~~width);
  var h  = Math.abs(~~height);

  this.sizes.push([w, h]);
  return this;
};

/**
 * Add bid provider allocated to the slot.
 *
 * @param {string} bidProvider the provider name
 * @returns {pubfood#model.Slot}
 */
Slot.prototype.addBidProvider = function(bidProvider) {
  this.bidProviders.push(bidProvider);
  return this;
};

util.extends(Slot, PubfoodObject);
module.exports = Slot;
