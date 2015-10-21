/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

//var util = require('../util');
//var BidProvider = require('../provider/bidprovider');
var Event = require('../event');
var Bid = require('../model/bid');

/**
 * BidMediator mediates provider bid requests.
 *
 * @class
 * @param {AuctionMediator} auctionMediator - auction mediator object
 * @memberof pubfood/mediator
 */
function BidMediator(auctionMediator) {
  this.auctionMediator = auctionMediator;
  this.operators = [];
}

/**
 * Initialize the bidders.
 *
 * @param {object} slotMap
 * @return {undefined}
 */
BidMediator.prototype.initBids = function(auctionState) {
  // TODO: run request operators here

  var providers = auctionState.providers;
  for (var k in providers) {
    this.getBids_(providers[k].provider, providers[k].slots);
  }
};

/**
 * Refresh the bids
 *
 * @param {Slot[]} slots
 */
BidMediator.prototype.refreshBids = function(/*slots*/) {

};

BidMediator.prototype.getBids_ = function(provider, slots) {
  var self = this;
  var name = provider.name;

  var pushBidCb = function(bid){
    self.pushBid(bid, name);
  };

  var doneCb = function(){
    self.doneBid(name);
  };

  provider.init(slots, {}, pushBidCb, doneCb);
};

/**
 * @todo add docs
 *
 * @param {number} bid The bid id
 * @return {undefined}
 */
BidMediator.prototype.pushBid = function(bid, providerName) {
  var b = Bid.fromObject(bid);
  b.provider = providerName;
  Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, b, 'bid');
};

/**
 * Notification that the bid is complete
 * @param {string} bidProvider The bid prodiver
 * @return {undefined}
 */
BidMediator.prototype.doneBid = function(bidProvider) {
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider, 'bid');
};

module.exports = BidMediator;
