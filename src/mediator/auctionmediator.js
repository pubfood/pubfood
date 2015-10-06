'use strict';

var util = require('../util');
var BaseMediator = require('./basemediator');

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood/mediator
 */
function AuctionMediator() {

}

util.inherits(AuctionMediator, BaseMediator);

module.exports = AuctionMediator;
