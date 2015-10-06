'use strict';

var util = require('../util');
var BaseMediator = require('./basemediator');

/**
 * BidMediator mediates provider bid requests.
 *
 * @class
 * @memberof pubfood/mediator
 */
function BidMediator() {

}

util.inherits(BidMediator, BaseMediator);

module.exports = BidMediator;
