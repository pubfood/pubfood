'use strict';

var util = require('../util');
var BaseProvider = require('./baseprovider');
var Rx = require('rx/dist/rx.lite');

/**
 * BidProvider implements bidding partner requests
 *
 * @class
 * @extends pubfood/provider.BaseProvider
 * @memberof pubfood/provider
 */
function BidProvider(bidDelegate) {
  this.slots_ = [];
  this.bidDelegate = bidDelegate;
}

/**
 * Set the provider name.
 *
 * @param {String} name - the bidder provider name
 * @returns {Function} this
 */
BidProvider.prototype.name = function(name) {
  this.name = name;
  return this;
};

/**
 * Add a slot to bid on.
 *
 * @param {Object} slot - a [Slot]{@link pubfood/model.Slot} object
 */
BidProvider.prototype.slot = function(slot) {
  this.slots_.push(slot);
  return this;
};

/**
 * Load a bid provider tag.
 *
 * @param {String} uri - the provider tag location. Used for [script src=]{@linkcode https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes} value
 * @param {Function} action - a callback to execute in response to the script [onload]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload} event
 */
BidProvider.prototype.load = function(uri, action) {
  // insertBefore(uri)
  // 'onload', action
};

/**
 * Refresh bids for ad slots
 */
BidProvider.prototype.refresh = function(action) {

};

util.inherits(BidProvider, BaseProvider);

module.exports = BidProvider;
