'use strict';

var util = require('../util');
var BaseMediator = require('./basemediator');

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers. 
 *
 * @class
 * @memberOf pubfood/mediator
 */
function AuctionMediator() {

}

util.inherits(AuctionMediator, BaseMediator);

module.exports = AuctionMediator;
