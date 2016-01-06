/**
 * pubfood
 */

'use strict';

var util = require('../util');
var Slot = require('../model/slot');
var Bid = require('../model/bid');
var BidAssembler = require('../assembler/bidassembler');
var RequestAssembler = require('../assembler/requestassembler');
var TransformOperator = require('../assembler/transformoperator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');
var Event = require('../event');

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood#mediator
 * @private
 */
function AuctionMediator(config) {
  if (config && config.optionalId) {
    this.id = config.optionalId;
  }

  /** @property {boolean} prefix if false, do not add bid provider name to bid targeting key. Default: true */
  this.prefix = config && config.hasOwnProperty('prefix') ? config.prefix : true;
  this.slots = [];
  // store slots by name for easy lookup
  this.slotMap = {};
  this.bidProviders = {};
  this.auctionProvider = null;
  this.bids_ = [];
  this.lateBids_ = [];
  this.bidStatus = {};
  this.inAuction = false;
  this.timeout_ = -1;
  this.trigger_ = null;
  this.initDoneTimeout_ = 2000;
  this.processTargetingCounter_ = 0;
  this.bidAssembler = new BidAssembler();
  this.requestAssembler = new RequestAssembler();
  this.callbackTimeout_ = 2000;
  this.processCounter_ = 0;
}

AuctionMediator.PAGE_BIDS = 'page';

/**
 * Validate provider and slot dependencies.
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.validate = function(isRefresh) {
  var isValid = true;
  /* eslint-disable no-unused-vars */
  var refresh = isRefresh || false;
  /* eslint-enable no-unused-vars */

  var tst = {
    hasAuctionProvider: function () {
      return !!this.auctionProvider;
    },
    hasBidProviders: function() {
      var ret = false;
      /* eslint-disable no-unused-vars */
      for (var v in this.bidProviders) {
        ret = true;
        break;
      }
      /* eslint-enable no-unused-vars */
      if (!ret) {
        Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: no bid providers'});
      }
      return ret;
    },
    hasSlots: function() {
      return this.slots.length !== 0;
    },
    hasAllSlotsBidder: function() {
      var noBidders = [];
      for (var i = 0; i < this.slots.length; i++) {
        var slot = this.slots[i];
        if (!slot.bidProviders || !slot.bidProviders[0]) {
          noBidders.push(slot.name);
        }
      }
      if (noBidders.length > 0) {
        Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: no bidders - ' + noBidders.join(', ')});
      }
      return noBidders.length === 0;
    }
  };

  tst.hasBidProviders.warn = true;
  for (var k in tst) {
    isValid = tst[k].call(this);
    isValid = tst[k].warn ? true : isValid;
    if (!isValid) {
      Event.publish(Event.EVENT_TYPE.INVALID, {msg: 'Failed: ' + k});
      break;
    }
  }

  return isValid;
};

/**
 * Sets the time in which bid providers must supply bids.
 *
 * @param {number} millis - milliseconds to set the timeout
 */
AuctionMediator.prototype.timeout = function(millis) {
  this.timeout_ = util.asType(millis) === 'number' ? millis : 2000;
};

/**
 * Gets the time in which bid providers must supply bids.
 *
 * @return {number} the timeout in milliseconds
 */
AuctionMediator.prototype.getTimeout = function() {
  return this.timeout_;
};

/**
 * The maximum time the auction provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setAuctionProviderCbTimeout = function(millis){
  this.initDoneTimeout_ = util.asType(millis) === 'number' ? millis : 2000;
};

/**
 * Set a custom function that receives a callback to start the auction.
 * <p>
 * The function parameter will receive a callback argument that is used
 * to start the auction.
 * <p>
 * If you have business or other logic that determines when the
 * auction must start a trigger function can be used.
 *
 * Otherwise, use [timeout()]{@link pubfood#mediator.AuctionMediator#timeout}.
 *
 * @param {function} triggerFn custom function with startAuction callback parameter
 * @example
 var trigger = function(startAuction) {
   setTimeout(function() {
       startAuction();
   }, 1500);
 };
 pf.setAuctionTrigger(trigger);
 */
AuctionMediator.prototype.setAuctionTrigger = function(triggerFn) {
  this.trigger_ = triggerFn;
};

/**
 * Start the process to build and send publisher ad server auction request.
 * @private
 */
AuctionMediator.prototype.startAuction_ = function() {
  Event.publish(Event.EVENT_TYPE.BID_ASSEMBLER, 'AuctionMediator');
  if (this.bidAssembler.operators.length > 0) {
    this.bidAssembler.process(this.bids_);
  }
  this.processTargeting_();
};

/**
 * Start the bid provider timeout.
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.startTimeout_ = function() {
  if (this.timeout_ !== -1 && this.timeout_ >= 0) {
    setTimeout(util.bind(this.startAuction_, this), this.timeout_);
  }
  return this;
};

/**
 * Start auction timeout or delegate to [setAuctionTrigger()]{@link pubfood#mediator.AuctionMediator#setAuctionTrigger}.
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.triggerAuction_ = function() {
  if (util.asType(this.trigger_) !== 'function') {
    this.startTimeout_();
    return;
  }

  function triggerAuction() {
    this.startAuction_();
  }

  this.trigger_.apply(null, [util.bind(triggerAuction, this)]);

  return this;
};

/**
 * Check bidder status if all are done.
 *
 * @returns {boolean} true if all bidders are complete. False otherwise.
 *
 */
AuctionMediator.prototype.allBiddersDone = function() {
  var allDone = true;
  for (var provider in this.bidStatus) {
    if (!this.bidStatus[provider]) {
      allDone = false;
      break;
    }
  }
  return allDone;
};

/**
 * Check the bid completion status for all bidder requests.
 *
 * If all bidders are complete, start the auction.
 *
 * @private
 */
AuctionMediator.prototype.checkBids_ = function() {
  if (this.allBiddersDone()) {
    this.startAuction_();
  }
};

AuctionMediator.prototype.getBidKey = function(bid) {
  return (this.prefix && bid.provider ? bid.provider + '_' : '') + (bid.label || 'bid');
};

AuctionMediator.prototype.mergeKeys = function(slotTargeting, bidTargeting) {
  slotTargeting = util.mergeToObject(slotTargeting, bidTargeting);
};

/**
 * Builds a map of slot and page-level bids.
 * @private
 * @return {object.<string, Bid>} targeting objects
 */
AuctionMediator.prototype.getBidMap_ = function() {
  var bidMap = {};
  bidMap[AuctionMediator.PAGE_BIDS] = [];
  for (var i = 0; i < this.bids_.length; i++) {
    var bid = this.bids_[i];
    if (bid.slot) {
      bidMap[bid.slot] = bidMap[bid.slot] || [];
      bidMap[bid.slot].push(bid);
    } else {
      bidMap[AuctionMediator.PAGE_BIDS].push(bid);
    }
  }
  return bidMap;
};

/**
 * Builds targeting objects for {AuctionDelegate} requests.
 *
 * Flattens all bid targeting into targeting object property. All bid specific
 * targeting is kept in the bid added to bids[].
 *
 * First bid with targeting[key] wins in top level flattened object.
 *
 * @private
 * @return {object[]} targeting objects
 */
AuctionMediator.prototype.buildTargeting_ = function() {
  var auctionTargeting = [];
  var bidSet;
  var bidMap = this.getBidMap_();

  // Slot-level targeting
  for (var i = 0; i < this.slots.length; i++) {
    var tgtObject = {bids: [], targeting: {}};

    var slot = this.slots[i];
    tgtObject.name = slot.name;
    tgtObject.id = slot.id;
    tgtObject.elementId = slot.elementId || '';
    tgtObject.sizes = slot.sizes;

    bidSet = bidMap[slot.name] || [];
    for (var j = 0; j < bidSet.length; j++) {
      var bid = bidSet[j];
      tgtObject.bids.push({
        value: bid.value || '',
        provider: bid.provider,
        id: bid.id,
        targeting: bid.targeting || {}
      });

      var bidKey = this.getBidKey(bid);
      tgtObject.targeting[bidKey] = tgtObject.targeting[bidKey] || (bid.value || '');
      this.mergeKeys(tgtObject.targeting, bid.targeting);
    }
    auctionTargeting.push(tgtObject);
  }

  var pgTgtObject = {bids: [], targeting: {}};;
  bidSet = bidMap[AuctionMediator.PAGE_BIDS] || [];

  // Page-level targeting
  for(var k = 0; k < bidSet.length; k++) {
    var bid = bidSet[k];

    pgTgtObject.bids.push({
      value: bid.value || '',
      provider: bid.provider,
      id: bid.id,
      targeting: bid.targeting
    });

    var bidKey = this.getBidKey(bid);
    pgTgtObject.targeting[bidKey] = pgTgtObject.targeting[bidKey] || (bid.value || '');
    this.mergeKeys(pgTgtObject.targeting, bid.targeting);
  }
  if (pgTgtObject.bids.length > 0) {
    auctionTargeting.push(pgTgtObject);
  }
  return auctionTargeting;
};

/**
 * process the targeting for the auction provider
 * @private
 */
AuctionMediator.prototype.processTargeting_ = function() {
  if (this.inAuction) return;
  this.inAuction = true;

  var self = this;
  var doneCalled = false;
  var name = self.auctionProvider.name;
  self.processTargetingCounter_++;

  var doneCb = function() {
    if (!doneCalled) {
      doneCalled = true;
      self.auctionDone(name);
    }
  };

  setTimeout(function() {
    if (!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The auction done callback for "' + name + '" hasn\'t been called within the allotted time (' + (self.initDoneTimeout_ / 1000) + 'sec)');
      doneCb();
    }
  }, self.initDoneTimeout_);

  Event.publish(Event.EVENT_TYPE.AUCTION_GO, name);

  var targeting = self.buildTargeting_();
  if (self.processTargetingCounter_ === 1) {
    self.auctionProvider.init(targeting, doneCb);
  } else {
    self.auctionProvider.refresh(targeting, doneCb);
  }
};

/**
 * Notification of auction complete
 *
 * @param {string} data The auction mediator's name
 * @fires AUCTION_COMPLETE
 */
AuctionMediator.prototype.auctionDone = function(data) {
  Event.publish(Event.EVENT_TYPE.AUCTION_COMPLETE, data);
  setTimeout(function() {
    // push this POST event onto the next tick of the event loop
    Event.publish(Event.EVENT_TYPE.AUCTION_POST_RUN, data);
    // TODO consider if delay should be zero or another default
    // TODO consider if delay should be tweakable
  }, 0);
};

/**
 * Add a [Slot]{@link pubfood#model.Slot} to [AuctionMediator]{@link pubfood#mediator.AuctionMediator} config.
 * @param {SlotConfig} slotConfig - configuration for a [Slot]{@link pubfood#model.Slot}
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addSlot = function(slotConfig) {
  var slot = Slot.fromObject(slotConfig);
  if (slot) {
    this.slots.push(slot);
    this.slotMap[slot.name] = slot;
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid slot object: ' + JSON.stringify(slotConfig || {}));
  }
  return slot;
};

/**
 * Add a [BidProvider]{@link pubfood#provider.BidProvider} configuration object.
 * @param {BidDelegate} delegateConfig - configuration for a [BidProvider]{@link pubfood#provider.BidProvider}
 * @returns {pubfood#provider.BidProvider}
 */
AuctionMediator.prototype.addBidProvider = function(delegateConfig) {

  var bidProvider = BidProvider.withDelegate(delegateConfig);
  if (bidProvider) {
    if(this.bidProviders[bidProvider.name]){
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: bid provider ' + bidProvider.name + ' is already added');
    } else {
      this.bidProviders[bidProvider.name] = bidProvider;
    }
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid bid provider: ' + delegateConfig.name);
  }
  return bidProvider;
};

AuctionMediator.prototype.bidProviderExists_ = function(name){
  return !!this.bidProviders[name];
};

/**
 * The maximum time the bid provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setBidProviderCbTimeout = function(millis){
  this.setBidProviderCbTimeout(millis);
};

/**
 * Add a [AuctionProvider]{@link pubfood#provider.AuctionProvider} configuration object.
 * @param {AuctionDelegate} delegateConfig - configuration for a [AuctionProvider]{@link pubfood#provider.AuctionProvider}
 * @returns {null|pubfood#provider.AuctionProvider}
 */
AuctionMediator.prototype.setAuctionProvider = function(delegateConfig) {
  if (this.auctionProvider) {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: auction provider exists: ' + this.auctionProvider.name);
  }
  var auctionProvider = AuctionProvider.withDelegate(delegateConfig);
  if(auctionProvider){
    this.auctionProvider = auctionProvider;
    this.auctionProvider.setMediator(this);
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid auction provider: ' + delegateConfig.name);
  }
  return auctionProvider;
};

/**
 * Adds a function to transform provider bid request parameters, before auction provider request
 *
 * @param {TransformDelegate} delegate the transformation delegate function
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addRequestTransform = function(delegate){
  this.requestAssembler.addOperator(new TransformOperator(delegate));
  return this;
};

/**
 * Adds a function to transform provider bid results.
 *
 * @param {TransformDelegate} delegate the transformation delegate function
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addBidTransform = function(delegate){
  this.bidAssembler.addOperator(new TransformOperator(delegate));
  return this;
};

/**
 * Load bid provider JavaScript library/tag.
 * @params {boolean} randomizeBidRequests
 */
AuctionMediator.prototype.loadProviders = function(randomizeBidRequests) {
  var uri;
  var keys = [];

  for (var bp in this.bidProviders) {
    keys.push(bp);
  }

  if (randomizeBidRequests) {
    util.randomize(keys);
  }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (this.bidProviders[key].libUri) {
      uri = this.bidProviders[key].libUri() || '';
      var sync = this.bidProviders[key].sync();
      util.loadUri(uri, sync);
    }
  }

  if (this.auctionProvider && this.auctionProvider.libUri()) {
    Event.publish(Event.EVENT_TYPE.AUCTION_LIB_LOADED, this.auctionProvider.name);

    uri = this.auctionProvider.libUri();
    // @todo get sync going here
    util.loadUri(uri);
  }
};

/**
 * Construct a set of slots for bidders.
 *
 * @returns {BidderSlots[]} bidderSlots an object containing an array of slots for each bidder.
 *
 */
AuctionMediator.prototype.getBidderSlots = function() {
  var bidderSlots = {};
  var ret = [];
  var i, k;

  for (i = 0; i < this.slots.length; i++) {
    var slot = this.slots[i];
    for (k = 0; k < slot.bidProviders.length; k++) {
      var provider = slot.bidProviders[k];

      var bSlots = bidderSlots[provider] = bidderSlots[provider] || [];
      bSlots.push(slot);
    }
  }

  for (k in this.bidProviders) {
    var provider = this.bidProviders[k];
    if (provider.enabled()) {
      ret.push({provider: provider, slots: bidderSlots[k] || []});
      this.bidStatus[k] = false;
    }
  }
  return ret;
};

/**
 * Start auction bidding.
 * @param {boolean} randomizeBidRequests
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.start = function(randomizeBidRequests) {
  this.triggerAuction_();

  this.loadProviders(randomizeBidRequests);

  var bidderSlots = this.getBidderSlots();

  this.processBids(bidderSlots);
  return this;
};

/**
 * Refresh bids for listed slot names.
 *
 * @param {string[]} slotNames slots to refresh
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.refresh = function(slotNames) {
  if(!util.isArray(slotNames)){
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid data structure, "refresh" accepts an array of strings (slot names)');
  } else {
    var i, slot;
    var self = this;

    // reset the slots
    this.slots = [];

    for (i=0; i< slotNames.length; i++) {
      slot = slotNames[i];
      if(!this.slotMap[slot]){
        Event.publish(Event.EVENT_TYPE.WARN, 'Can\'t refresh slot "'+ slot +'", because it wasn\'t defined');
      } else {
        this.slots.push(this.slotMap[slot]);
      }
    }

    if(this.slots.length > 0) {
      var name = this.auctionProvider.name;
      Event.publish(Event.EVENT_TYPE.AUCTION_REFRESH, name);

      this.bids_ = [];
      this.lateBids_ = [];

      // trigger bid provider refresh
      var bidderSlots = this.getBidderSlots();
      this.processBids(bidderSlots);

      // trigger auction provider refresh
      var doneCalled = false;
      var doneCb = function() {
        if (!doneCalled) {
          doneCalled = true;
          self.auctionDone(name);
        }
      };

      setTimeout(function(){
        if (!doneCalled) {
          Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The auction done callback for "'+name+'" hasn\'t been called within the allotted time (' + (self.initDoneTimeout_/1000) + 'sec)');
          doneCb();
        }
      }, this.initDoneTimeout_);

      var targeting = this.buildTargeting_();
      this.auctionProvider.refresh(targeting, doneCb);
    }
  }
  return this;
};

/**
 * Process tht bidders bids
 *
 * @param {BidderSlots[]} bidderSlots object containing slots per bidder
 */
AuctionMediator.prototype.processBids = function(bidderSlots) {
  this.processCounter_++;
  for (var k in bidderSlots) {
    this.getBids_(bidderSlots[k].provider, bidderSlots[k].slots);
  }
};

/**
 * The maximum time the bid provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setBidProviderCbTimeout = function(millis){
  this.callbackTimeout_ = util.asType(millis) === 'number' ? millis : 2000;
};

/**
 * @param {object} provider
 * @param {object} slots
 * @private
 */
AuctionMediator.prototype.getBids_ = function(provider, slots) {
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
 * Pushes a [BidObject]{@link typeDefs.BidObject} to be available for auction processing.
 *
 * @param {BidObject} bid object from which to build a [Bid]{@link pubfood#model.Bid}
 * @param {string} providerName the name of the [BidProvider]{@link pubfood#provider.BidProvider}
 * @fires pubfood.PubfoodEvent.BID_PUSH_NEXT
 */
AuctionMediator.prototype.pushBid = function(bidObject, providerName) {
  var bid = Bid.fromObject(bidObject);
  if (bid) {
    bid.provider = providerName;
    Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, bid);
    if (!this.inAuction) {
      this.bids_.push(bid);
    } else {
      this.lateBids_.push(bid);
    }
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid bid object: ' + JSON.stringify(bidObject || {}));
  }
};

/**
 * Notification that the [BidProvider]{@link pubfood#provider.BidProvider} bidding is complete.
 *
 * @param {string} bidProvider The [BidProvider]{@link pubfood#provider.BidProvider} name
 * @fires pubfood.PubfoodEvent.BID_COMPLETE
 */
AuctionMediator.prototype.doneBid = function(bidProvider) {
  // TODO consider having useful bid data available upon completion like the bids
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider);
  this.bidStatus[bidProvider] = true;
  this.checkBids_();
};

module.exports = AuctionMediator;
