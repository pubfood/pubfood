'use strict';

var util = require('../util');
var BaseAssembler = require('./baseassembler');

/**
 * BidAssembler builds the set of [Bids]{@link pubfood/model.Bid} for a
 * publisher ad server request [AuctionProvider]{@link pubfood/provider.AuctionProvider}.
 *
 * @class
 * @memberof pubfood/mediator
 */
function BidAssembler() {

}

util.inherits(BidAssembler, BaseAssembler);

module.exports = BidAssembler;
