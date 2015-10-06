'use strict';

var util = require('../util');
var BaseProvider = require('./baseprovider');
var Rx = require('rx/dist/rx.lite');

/**
 * BidDelegate defines delegate interface to provide bids.
 *
 * @class
 * @memberof pubfood/provider
 */
function BidDelegate(tagUri) {
  this.tagUri = tagUri;
}

BidDelegate.prototype.slot = function() {

};

BidDelegate.prototype.slot = function() {

};

BidDelegate.prototype.refresh = function(action) {

};

module.exports = BidDelegate;
