/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var Slot = require('../model/slot');
var BidMediator = require('./bidmediator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');
var Event = require('../event');

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
  this.bidMediator = null;
  this.slotMap = { slots: {}, providers: {} };
  this.bids_ = [];
}

/**
 * Initialize the auction
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.init = function() {
  Event.on(Event.EVENT_TYPE.BID_COMPLETE, this.checkBids_.bind(this));
  Event.on(Event.EVENT_TYPE.BID_NEXT, this.setBid_.bind(this));
  Event.on(Event.EVENT_TYPE.AUCTION_COMPLETE, function(data) { console.log(data); });
  return this;
};

/**
 * @todo add docs
 *
 * @param {object} data
 * @return {AuctionMediator}
 * @private
 */
AuctionMediator.prototype.setBid_ = function(data) {
  this.bids_.push(data);
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
    this.go_();
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
 * @param {object} slotConfig - configuration for a [Slot]{@link pubfood#model.Slot}
 * @returns {AuctionMediator}
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
 * @todo add docs
 *
 * @param {requestOperatorCallback} cb
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addRequestOperator = function(/*cb*/){

};

/**
 * @todo add docs
 *
 * @param {transformOperatorCallback} cb
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addTransformOperator = function(/*cb*/){

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
 * Get bid providers for the given slot name.
 *
 * @param {string} slotName - name of the slot
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.getSlotBidders = function (slotName) {
  return this.slotMap.slots[slotName] || {};
  return this;
};

/**
 * Start auction bidding.
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.start = function() {
  Event.publish(Event.EVENT_TYPE.AUCTION_GO, this.auctionProvider.name_, 'auction');

  this.init();
  this.bidMediator = new BidMediator(this);

  this.loadProviders();
  this.bidMediator.initBids(this.slotMap);
  return this;
};

/**
 *
 * @param {string[]} slotNames
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.refresh = function(/*slotNames*/) {
  Event.publish(Event.EVENT_TYPE.AUCTION_REFRESH, this.auctionProvider.name_, 'auction');

  var slots = [];
  this.bidMediator.refreshBids(slots);
  return this;
};

module.exports = AuctionMediator;
