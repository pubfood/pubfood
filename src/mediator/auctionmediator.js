/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var Slot = require('../model/slot');
var BidMediator = require('./bidmediator');
var BidAssembler = require('../assembler/bidassembler');
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
  this.slotMap = { slots: {}, providers: {} };
  this.bids_ = [];
  this.inAuction = false;
  this.timeout_ = -1;
  this.trigger_ = null;
  this.bidMediator = new BidMediator(this);
  this.bidAssembler = new BidAssembler(this);

}

/**
 * Initialize the auction
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.init = function() {
  Event.on(Event.EVENT_TYPE.BID_COMPLETE, util.bind(this.checkBids_, this));
  Event.on(Event.EVENT_TYPE.BID_NEXT, util.bind(this.setBid_, this));
  Event.on(Event.EVENT_TYPE.AUCTION_COMPLETE, function(data) { console.log(data); });
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
  var refresh = isRefresh || false;

  var tst = {
    hasAuctionProvider: function () {
      return !!this.auctionProvider;
    },
    hasBidProviders: function() {
      var ret = false;
      for (var v in this.bidProviders) {
        ret = true;
        break;
      }
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
AuctionMediator.prototype.setTimeout = function(millis) {
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
  this.inAuction = true;
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
  if (this.inAuction) return this;

  if (!this.trigger) {
    this.startTimeout_();
    return;
  }

  function done() {
    this.startAuction_();
  }

  this.trigger(util.bind(done, this));

  return this;
};

/**
 * Adds bid on {pubfood.PubfoodEvent.BID_NEXT} event.
 *
 * @param {object} data
 * @return {AuctionMediator}
 * @private
 */
AuctionMediator.prototype.setBid_ = function(event) {
  this.bids_.push(event.data);
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
 * @todo add docs
 *
 * @private
 * @return {undefined}
 */
AuctionMediator.prototype.go_ = function() {
  var self = this;

  //if (self.inAuction) return;
  self.inAuction = true;

  var name = self.auctionProvider.name;

  Event.publish(Event.EVENT_TYPE.AUCTION_GO, name, 'auction');

  //var ctx = {eventEmitter: this.eventEmitter, data: {provider: this.auctionProvider.name}};
  this.auctionProvider.init(this.slots, this.bids_, {}, function(){
    self.auctionDone(name);
  });
};

/**
 * Notification of acution complete
 *
 * @param {string} data The auction mediator's name
 * @return {undefined}
 */
AuctionMediator.prototype.auctionDone = function(data) {
  Event.publish(Event.EVENT_TYPE.AUCTION_COMPLETE, data, 'auction');
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

    /*
     * Keep a mapping from slot.name to bid provider objects.
     * If we already have a slot property name use it
     */
    this.slotMap.slots[slot.name] = this.slotMap.slots[slot.name] || {};
    this.updateSlotBidProviders(slot);
  }
  return this;
};

/**
 * Update the Slot's bid providers
 *
 * @param {Slot} slot
 * @return {undefined}
 */
AuctionMediator.prototype.updateSlotBidProviders = function(slot) {

  var providers = slot.bidProviders || {};

  for (var k in providers) {
    var providerName = k;

    this.slotMap.providers[providerName] = this.slotMap.providers[providerName] || {};

    this.slotMap.slots[slot.name][providerName] = this.slotMap.providers[providerName];
    this.slotMap.providers[providerName].slots = this.slotMap.providers[providerName].slots || {};
    this.slotMap.providers[providerName].slots[slot.name] = slot;
  }
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

    if (!this.slotMap.providers[bidProvider.name]) {
      this.slotMap.providers[bidProvider.name] = {};
    }
    this.slotMap.providers[bidProvider.name].provider = bidProvider;
  }
  return this.bidProvider;
};

/**
 * Add a [AuctionProvider]{@link pubfood#provider.AuctionProvider} configuration object.
 * @param {AuctionDelegate} delegateConfig - configuration for a [AuctionProvider]{@link pubfood#provider.AuctionProvider}
 * @returns {pubfood#provider.AuctionProvider}
 */
AuctionMediator.prototype.setAuctionProvider = function(delegateConfig) {
  var auctionProvider = AuctionProvider.withDelegate(delegateConfig);
  this.auctionProvider = auctionProvider;
  this.auctionProvider.setMediator(this);
  return this.auctionProvider;
};

/**
 * Adds a function to transform provider bid request parameters.
 *
 * @param {TransformDelegate} delegate the transformation delegate function
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addRequestTransform = function(delegate){

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
  var loadedBidders = 0;
  var uri;

  function bidderLoaded() {
    loadedBidders++;
  }

  for (var k in this.bidProviders) {
    if (this.bidProviders[k].libUri) {
      uri = this.bidProviders[k].libUri() || '';
      var sync = this.bidProviders[k].sync();
      util.loadUri(uri, sync);
    }
  }

  if (this.auctionProvider && this.auctionProvider.libUri()) {
    Event.publish(Event.EVENT_TYPE.AUCTION_LIB_LOADED, this.auctionProvider.name_, 'auction');

    uri = this.auctionProvider.libUri();
    // @todo remove the assumption that google is the auction provider
    window.googletag.cmd.push(bidderLoaded);
    util.loadUri(uri);
  }
};

/**
 * Start auction bidding.
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.start = function() {

  Event.publish(Event.EVENT_TYPE.AUCTION_GO, this.auctionProvider.name_, 'auction');

  this.init();
  Event.publish(Event.EVENT_TYPE.AUCTION_TRIGGER);

  this.loadProviders();
  this.bidMediator.initBids(this.slotMap);
  return this;
};

/**
 * Refresh bids for listed slot names.
 *
 * @param {string[]} slotNames slots to refresh
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.refresh = function(slotNames) {
  Event.publish(Event.EVENT_TYPE.AUCTION_REFRESH, this.auctionProvider.name_, 'auction');

  this.bidMediator.refreshBids(slotNames);
  return this;
};

module.exports = AuctionMediator;
