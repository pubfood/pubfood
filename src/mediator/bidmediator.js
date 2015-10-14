/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

var util = require('../util');
var BidProvider = require('../provider/bidprovider');
var EventEmitter = require('eventemitter3');
var events = require('../events');
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
  this.eventEmitter = auctionMediator.eventEmitter;
}

BidMediator.prototype.initBids = function(slots) {
  var bidderSlots = {};
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];

    var providers = this.auctionMediator.getSlotBidders(slot.name);
    for (var k in providers) {
      bidderSlots[k] = bidderSlots[k] || {};
      bidderSlots[k].provider = providers[k].provider;
      bidderSlots[k].slots = bidderSlots[k].slots || [];
      bidderSlots[k].slots.push(slot);
    }
  }

  // TODO: run request operators here

  for (k in bidderSlots) {
    var slots = bidderSlots[k].slots;

    this.loadProvider(bidderSlots[k].provider, {});
    this.getBids_(bidderSlots[k].provider, slots);
  }
};

BidMediator.prototype.loadProvider = function(provider, callback) {

};

BidMediator.prototype.refreshBids = function(slots) {
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
  }
};

BidMediator.prototype.getBids_ = function(provider, slots) {
  provider.init(slots,
                {},
                util.bind(this.nextBid, this), //this.nextBid.bind(this),
                util.bind(this.doneBid, this)); //this.doneBid.bind(this));
};


BidMediator.prototype.nextBid = function(bid) {
  var b = Bid.fromObject(bid);
  this.eventEmitter.emit(events.EVENT_TYPE.BID_NEXT, b);
  console.log(''+b);
};

BidMediator.prototype.doneBid = function(data) {
  this.eventEmitter.emit(events.EVENT_TYPE.BID_COMPLETE, data);
};

module.exports = BidMediator;
