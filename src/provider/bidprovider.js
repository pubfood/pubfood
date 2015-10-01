'use strict';

var util = require('../util');
var BaseProvider = require('./baseprovider');

/**
 * BidProvider implements bidding partner requests
 *
 * @class
 * @memberOf pubfood/provider
 */
function BidProvider() {

}

util.inherits(BidProvider, BaseProvider);

module.exports = BidProvider;
