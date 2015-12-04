/**
 * pubfood
 */

'use strict';

var util = require('../util');
var PubfoodObject = require('../pubfoodobject');
var BidObject = require('../interfaces').BidObject;

/**
 * Bid is the result of a partner [BidProvider]{@link pubfood/provider.BidProvider} request.
 *
 * @class
 * @param {string} slot the slot name
 * @param {string|number} value the bid value. Default: empty string.
 * @param {Array.<number, number>} sizes the dimension sizes of the slot bid
 * @memberof pubfood#model
 */
function Bid(slot, value, sizes) {
  if (this.init_) {
    this.init_();
  }
  this.sizes = sizes;
  this.slot = slot;
  this.value = value;
  /** @property {string} type bid value type derived from {@link util.asType}  */
  this.type = util.asType(this.value);
  /** @property {string} [label] optional label for adserver key targeting for bid value e.g. <label>=2.00 */
  this.label;
  /** @property {string} [provider] the bid provider name */
  this.provider;
}

/**
 * Validate the bid config
 *
 * @param {BidObject} config
 * @return {boolean}
 * @private
 */
Bid.validate = function(config) {
  if (!config) return false;
  return util.validate(BidObject, config);
};

/**
 * Create a new [Bid]{@link pubfood#model.Bid} from an object.
 *
 * @param {BidObject} config bid object literal
 * @returns {pubfood#model.Bid|null} instance of [Bid]{@link pubfood#model.Bid}
 * @private
 */
Bid.fromObject = function(config) {
  if (!Bid.validate(config)) return null;
  var b = new Bid();
  for (var k in config) {
    if (util.asType(b[k]) === 'function') {
      b[k](config[k]);
    } else {
      b[k] = config[k];
    }
  }
  var vType = util.asType(b.value);
  b.type = vType !== 'undefined' ? vType : '';
  return b;
};

/**
 * Sets the bid's value
 * @param {string|number} v
 * @return {pubfood#model.Bid}
 */
Bid.prototype.setValue = function(v) {
  this.value = v || '';
  this.type = util.asType(this.value);
  return this;
};

/**
 * Sets the bid's slot size
 *
 * @todo maybe combine with Bid.prototype.dimensions
 *
 * @param {string|number} w
 * @param {string|number} h
 * @return {pubfood#model.Bid}
 */
Bid.prototype.addSize = function(w, h) {
  var width = Math.abs(~~w);
  var height = Math.abs(~~h);

  this.sizes.push([width, height]);
  return this;
};

util.extends(Bid, PubfoodObject);
module.exports = Bid;
