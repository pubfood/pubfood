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
 * @param {object} auctionMediator - auction mediator object
 * @memberof pubfood/mediator
 */
function BidMediator(auctionMediator) {
  this.auctionMediator = auctionMediator;
  this.operators = [];
}

/**
 * Initialize the bid
 *
 * @param {object} slotMap
 * @return {undefined}
 */
BidMediator.prototype.initBids = function(slotMap) {
  // TODO: run request operators here

  var providers = slotMap.providers;
  for (var k in providers) {

    this.loadProvider(providers[k], {});
    this.getBids_(providers[k]);
  }
};

/**
 * @todo add docs
 *
 * @param {object} provider
 * @param {function} callback
 */
BidMediator.prototype.loadProvider = function(/*provider, callback*/) {

};

/**
 * Refresh the bids
 *
 * @param {Slot[]} slots
 */
BidMediator.prototype.refreshBids = function(/*slots*/) {
  //for (var i = 0; i < slots.length; i++) {
  //  var slot = slots[i];
  //}
};

BidMediator.prototype.getBids_ = function(slotMapItem) {
  var slots = slotMapItem.slots;
  var provider = slotMapItem.provider;
  var self = this;
  var name = provider.name;
  
  var nextBidCb = function(bid){
    self.nextBid(bid, name);
  };
  
  var doneCb = function(){
    self.doneBid(name);
  };
  
  provider.init(slots, {}, nextBidCb, doneCb);
};

/**
 * @todo add docs
 *
 * @param {number} bid The bid id
 * @return {undefined}
 */
BidMediator.prototype.nextBid = function(bid, providerName) {
  var b = Bid.fromObject(bid);
  b.provider = providerName;
  Event.publish(Event.EVENT_TYPE.BID_NEXT, b);
};

/**
 * Notification that the bid is complete
 * @param {string} bidProvider The bid prodiver
 * @return {undefined}
 */
BidMediator.prototype.doneBid = function(bidProvider) {
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider);
};

module.exports = BidMediator;
