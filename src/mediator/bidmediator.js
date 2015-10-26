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

/**
 * @private
 */
BidMediator.prototype.getBids_ = function(provider, slots) {
  var self = this;
  var name = provider.name;
  var doneCalled = false;

  var pushBidCb = function(bid){
    self.pushBid(bid, name);
  };

  var bidDoneCb = function(){
    if(!doneCalled) {
      doneCalled = true;
      self.doneBid(name);
    }
  };

  setTimeout(function(){
    if(!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The bid done callback for "'+name+'" hasn\'t been called within the allotted time (2sec)', 'bidmediator');
      bidDoneCb();
    }
  }, 2000);

  provider.init(slots, {}, pushBidCb, bidDoneCb);
};

/**
 * Raises an event to notify listeners of a [Bid]{@link pubfood#model.Bid} available.
 *
 * @param {Bid} bid The bid id
 * @param {string} providerName the name of the [BidProvider]{@link pubfood#provider.BidProvider}
 * @fires pubfood.PubfoodEvent.BID_PUSH_NEXT
 */
BidMediator.prototype.pushBid = function(bid, providerName) {
  var b = Bid.fromObject(bid);
  b.provider = providerName;
  Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, b, providerName);
};

/**
 * Notification that the [BidProvider]{@link pubfood#provider.BidProvider} bidding is complete.
 *
 * @param {string} bidProvider The [BidProvider]{@link pubfood#provider.BidProvider} name
 * @fires pubfood.PubfoodEvent.BID_COMPLETE
 */
BidMediator.prototype.doneBid = function(bidProvider) {
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider, 'bid');
};

module.exports = BidMediator;
