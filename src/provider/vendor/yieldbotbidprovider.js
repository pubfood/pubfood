'use strict';

var util = require('../../util');
var BidProvider = require('../bidprovider');

/**
 * YieldbotBidProvider requests bids from Yieldbot.
 *
 * @class
 * @extends pubfood/provider.BidProvider
 * @memberOf pubfood/provider/vendor
 */
function YieldbotBidProvider() {
    this.slots_ = [];
}

/*
 * Refresh bids for ad slots
 * @override
 */
YieldbotBidProvider.prototype.refresh = function() {};

util.inherits(YieldbotBidProvider, BidProvider);

module.exports = YieldbotBidProvider;
