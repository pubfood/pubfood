/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var Slot = require('../model/slot');
var BidMediator = require('./bidmediator');
var BidAssembler = require('../assembler/bidassembler');
var RequestAssembler = require('../assembler/requestassembler');
var TransformOperator = require('../assembler/transformoperator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');
var Event = require('../event');

/**
 * @typedef {AuctionMediator} AuctionMediator [AuctionMediator]{@link pubfood#mediator.AuctionMediator}
 */

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood#mediator
 */
function AuctionMediator(optionalId) {
  if (optionalId) {
    this.id = optionalId;
  }

  this.bidCount = 0;
  this.slots = [];
  this.bidProviders = {};
  this.auctionProvider = null;
  this.auctionState_ = { slots: {}, providers: {}, bids: []};
  this.bids_ = [];
  this.lateBids_ = [];
  this.inAuction = false;
  this.timeout_ = -1;
  this.trigger_ = null;
  this.bidMediator = new BidMediator(this);
  this.bidAssembler = new BidAssembler(this);
  this.requestAssembler = new RequestAssembler();
}

/**
 * Initialize the auction
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.init = function() {
  Event.on(Event.EVENT_TYPE.BID_COMPLETE, util.bind(this.checkBids_, this));
  Event.on(Event.EVENT_TYPE.BID_PUSH_NEXT, util.bind(this.pushBid_, this));
  // Event.on(Event.EVENT_TYPE.AUCTION_COMPLETE, function(data) { console.log(data); });
  Event.on(Event.EVENT_TYPE.AUCTION_TRIGGER, util.bind(this.triggerAuction_, this));
  return this;
};

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
        Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: no bid providers'}, 'validation');
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
        Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: no bidders - ' + noBidders.join(', ')}, 'validation');
      }
      return noBidders.length === 0;
    }
  };

  tst.hasBidProviders.warn = true;
  for (var k in tst) {
    isValid = tst[k].call(this);
    isValid = tst[k].warn ? true : isValid;
    if (!isValid) {
      Event.publish(Event.EVENT_TYPE.INVALID, {msg: 'Failed: ' + k}, 'validation');
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
  this.timeout_ = millis;
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
 * Force auction provider to init.
 *
 * @param {object}  event
 * @return {AuctionMediator}
 * @private
 */
AuctionMediator.prototype.setAuctionTrigger = function(triggerFn) {
  this.trigger = triggerFn;
};

AuctionMediator.prototype.startAuction_ = function() {
  Event.publish(Event.EVENT_TYPE.BID_ASSEMBLER, 'AuctionMediator', 'assembler');
  this.bidAssembler.process(this.bids_);
  this.go_();
};

/**
 * Start the bid provider timeout.
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.startTimeout_ = function() {
  if (this.timeout_ !== -1 && this.timeout_ >= 0) {
    setTimeout(util.bind(this.startAuction_, this), this.timeout_);
  }
  return this;
};

/**
 * Force auction provider to init.
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.triggerAuction_ = function() {
  if (!this.trigger) {
    this.startTimeout_();
    return;
  }

  function triggerAuction() {
    this.startAuction_();
  }

  this.trigger(util.bind(triggerAuction, this));

  return this;
};

/**
 * Adds bid on {pubfood.PubfoodEvent.BID_PUSH_NEXT} event.
 *
s   * @param {object} data
 * @return {AuctionMediator}
 * @private
 */
AuctionMediator.prototype.pushBid_ = function(event) {
  if (!this.inAuction) {
    var bid = event.data;
    bid.type = 'slot';
    bid.provider = event.provider;
    this.bids_.push(bid);

    bid.provider_ = this.auctionState_.providers[bid.provider];
    bid.slot = this.auctionState_.slots[event.data.slot];

    this.auctionState_.bids.push(bid);
    this.auctionState_.slots[event.data.slot.name].bids.push(bid);
  } else {
    this.lateBids_.push(event.data);
  }
  return this;
};

/**
 * @todo add docs
 *
 * @private
 * @return {undefined}
 */
AuctionMediator.prototype.checkBids_ = function(/*data*/) {
  this.bidCount++;
  if (this.bidCount === Object.keys(this.bidProviders).length) {
    this.startAuction_();
  }
};

/**
 * Start the auction delegate.
 *
 * @private
 * @return {undefined}
 */
AuctionMediator.prototype.go_ = function() {
  var self = this;

  if (this.inAuction) return;
  this.inAuction = true;

  var doneCalled = false;
  var name = self.auctionProvider.name;

  var doneCb = function(){
    if(!doneCalled) {
      doneCalled = true;
      self.auctionDone(name);
    }
  };

  setTimeout(function(){
    if(!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The auction done callback for "'+name+'" hasn\'t been called within the allotted time (2sec)', 'bidmediator');
      doneCb();
    }
  }, 2000);

  Event.publish(Event.EVENT_TYPE.AUCTION_GO, name, 'auction');

  var options = this.auctionProvider.options || {};

  var targeting = this.buildTargeting_();
  this.auctionProvider.init(targeting, options, doneCb);
};

AuctionMediator.prototype.getBidKey = function(bid) {
  var opts = this.auctionProvider.getOptions();

  return (opts.prefix ? bid.provider + '_' : '') + (opts.bidKey || 'bid');
};

AuctionMediator.prototype.mergeKeys = function(slotTargeting, bidTargeting) {
  slotTargeting = util.mergeToObject(slotTargeting, bidTargeting);
};

/**
 * Builds targeting objects for {AuctionDelegate} requests.
 * @private
 * @return {object[]} targeting objects
 */
AuctionMediator.prototype.buildTargeting_ = function() {
  var auctionTargeting = [];
  var slots = this.auctionState_.slots || [];
  for (var k in slots) {
    var s = slots[k];
    var t = { type: 'slot',
              name: s.name,
              id: s.id,
              elementId: s.elementId || '',
              sizes: s.sizes,
              bids: [],
              targeting: {}
            };
    var bids = slots[k].bids;
    for (var b in bids) {
      var bid = bids[b];
      t.bids.push({
        provider: bid.provider,
        id: bid.id,
        targeting: bid.targeting
      });
      this.mergeKeys(t.targeting, bid.targeting);
    }

    auctionTargeting.push(t);
  }
  return auctionTargeting;
};

/**
 * Notification of acution complete
 *
 * @param {string} data The auction mediator's name
 * @fires pubfood.PubfoodEvent.AUCTION_COMPLETE
 */
AuctionMediator.prototype.auctionDone = function(data) {
  Event.publish(Event.EVENT_TYPE.AUCTION_COMPLETE, data, 'auction');
};

AuctionMediator.initTargetingSlot_ = function(auctionState, slot) {
  auctionState.slots[slot.name] = auctionState.slots[slot.name] || slot;
  auctionState.slots[slot.name].bids = auctionState.slots[slot.name].bids || [];
};

AuctionMediator.initTargetingProvider_ = function(auctionState, slot, providerName) {
  auctionState.providers[providerName] = auctionState.providers[providerName] || {};
  auctionState.providers[providerName].slots = auctionState.providers[providerName].slots || {};
  auctionState.providers[providerName].slots[slot.name] = slot;
  auctionState.slots[slot.name].bidProviders[providerName].provider = auctionState.providers[providerName];

};

AuctionMediator.prototype.addTargetingSlot_ = function(slot) {
  AuctionMediator.initTargetingSlot_(this.auctionState_, slot);
  this.updateTargetingProviders_(slot);
};

AuctionMediator.prototype.updateTargetingProviders_ = function(slot) {
  var providers = slot.bidProviders || {};
  for (var k in providers) {
    var providerName = k;
    AuctionMediator.initTargetingProvider_(this.auctionState_, slot, providerName);
  }
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

    this.addTargetingSlot_(slot);
  }
  return this;
};

/**
 * Add a [BidProvider]{@link pubfood#provider.BidProvider} configuration object.
 * @param {BidDelegate} delegateConfig - configuration for a [BidProvider]{@link pubfood#provider.BidProvider}
 * @returns {pubfood#provider.BidProvider}
 */
AuctionMediator.prototype.addBidProvider = function(delegateConfig) {

  var bidProvider = BidProvider.withDelegate(delegateConfig);
  if (bidProvider) {
    this.bidProviders[bidProvider.name] = bidProvider;

    if (!this.auctionState_.providers[bidProvider.name]) {
      this.auctionState_.providers[bidProvider.name] = {};
    }
    this.auctionState_.providers[bidProvider.name].provider = bidProvider;
  }
  return bidProvider;
};

/**
 * Add a [AuctionProvider]{@link pubfood#provider.AuctionProvider} configuration object.
 * @param {AuctionDelegate} delegateConfig - configuration for a [AuctionProvider]{@link pubfood#provider.AuctionProvider}
 * @returns {null|pubfood#provider.AuctionProvider}
 */
AuctionMediator.prototype.setAuctionProvider = function(delegateConfig) {
  if (this.auctionProvider) {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: auction provider exists: ' + this.auctionProvider.name, 'auctionmediator');
  }
  var auctionProvider = AuctionProvider.withDelegate(delegateConfig);
  if(!auctionProvider){
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid auction provider: ' + this.auctionProvider.name, 'auctionmediator');
  } else {
    this.auctionProvider = auctionProvider;
    this.auctionProvider.setMediator(this);
  }
  return this.auctionProvider;
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
 * @params {*} action
 * @returns {undefined}
 */
AuctionMediator.prototype.loadProviders = function(/*action*/) {
  var uri;

  for (var k in this.bidProviders) {
    if (this.bidProviders[k].libUri) {
      uri = this.bidProviders[k].libUri() || '';
      var sync = this.bidProviders[k].sync();
      util.loadUri(uri, sync);
    }
  }

  if (this.auctionProvider && this.auctionProvider.libUri()) {
    Event.publish(Event.EVENT_TYPE.AUCTION_LIB_LOADED, this.auctionProvider.name, 'auction');

    uri = this.auctionProvider.libUri();
    // @todo get sync going here
    util.loadUri(uri);
  }
};

/**
 * Start auction bidding.
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.start = function() {

  Event.publish(Event.EVENT_TYPE.AUCTION_GO, this.auctionProvider.name, 'auction');

  this.init();
  Event.publish(Event.EVENT_TYPE.AUCTION_TRIGGER);

  this.loadProviders();
  this.bidMediator.initBids(this.auctionState_);
  return this;
};

/**
 * Refresh bids for listed slot names.
 *
 * @param {string[]} slotNames slots to refresh
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.refresh = function(slotNames) {
  Event.publish(Event.EVENT_TYPE.AUCTION_REFRESH, this.auctionProvider.name, 'auction');

  this.bidMediator.refreshBids(slotNames);
  return this;
};

module.exports = AuctionMediator;
