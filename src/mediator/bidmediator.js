/**
 * pubfood
 */

'use strict';

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
  this.callbackTimeout_ = 2000;
  this.processCounter_ = 0;
}

/**
 * Process tht bidders bids
 *
 * @param {object} bidderSlots object containing slots per bidder
 * @return {undefined}
 */
BidMediator.prototype.processBids = function(bidderSlots) {
  this.processCounter_++;
  for (var k in bidderSlots) {
    this.getBids_(bidderSlots[k].provider, bidderSlots[k].slots);
  }
};

/**
 * The maximum time the bid provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 * @return {undefined}
 */
BidMediator.prototype.setBidProviderCbTimeout = function(millis){
  this.callbackTimeout_ = typeof millis === 'number' ? millis : 2000;
};

/**
 * @param {object} provider
 * @param {object} slots
 * @private
 * @return {undefined}
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

  Event.publish(Event.EVENT_TYPE.BID_START, name);
  provider.init(slots, pushBidCb, bidDoneCb);

  setTimeout(function(){
    if(!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The bid done callback for "'+name+'" hasn\'t been called within the allotted time (2sec)');
      bidDoneCb();
    }
  }, this.callbackTimeout_);

  Event.publish(Event.EVENT_TYPE.BID_START, name);
  if(this.processCounter_ === 1){
    provider.init(slots, pushBidCb, bidDoneCb);
  } else {
    provider.refresh(slots, pushBidCb, bidDoneCb);
  }
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
  Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, b);
};

/**
 * Notification that the [BidProvider]{@link pubfood#provider.BidProvider} bidding is complete.
 *
 * @param {string} bidProvider The [BidProvider]{@link pubfood#provider.BidProvider} name
 * @fires pubfood.PubfoodEvent.BID_COMPLETE
 */
BidMediator.prototype.doneBid = function(bidProvider) {
  // TODO consider having useful bid data available upon completion like the bids
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider);
};

module.exports = BidMediator;
