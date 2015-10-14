/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

var util = require('../util');
var Slot = require('../model/slot');
var BidMediator = require('./bidmediator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');
var EventEmitter = require('eventemitter3');
var events = require('../events');
/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood/mediator
 */
function AuctionMediator(optionalId) {
  if (optionalId) {
    this.id = optionalId;
  }
  this.slots = [];
  this.bidProviders = {};
  this.auctionProvider = null;
  this.bidMediator = null;

  this.slotMap = { slots: {}, providers: {} };

  this.eventEmitter = new EventEmitter();

  this.bids_ = [];
}

AuctionMediator.prototype.init = function() {
  var counter = 0;
  this.eventEmitter.on(events.EVENT_TYPE.BID_COMPLETE,
             this.checkBids_.bind(this));
  this.eventEmitter.on(events.EVENT_TYPE.BID_NEXT, this.setBid_.bind(this));

};

AuctionMediator.prototype.setBid_ = function(data) {
  this.bids_.push(data);
};

AuctionMediator.prototype.checkBids_ = function(data) {
  if (!this.bidCount) this.bidCount = 0;
  this.bidCount++;
  if (this.bidCount === Object.keys(this.bidProviders).length) {
    this.go_();
  }
};

AuctionMediator.prototype.go_ = function() {
  this.auctionProvider.init(this.slots, this.bids_, {}, this.auctionDone);
};

AuctionMediator.prototype.auctionDone = function(data) {
  console.log('Auction done: ' + data);
};

/**
 * Add a [Slot]{@link pubfood/model.Slot} to [AuctionMediator]{@link pubfood/mediator.AuctionMediator} config.
 * @param {object} slotConfig - configuration for a [Slot]{@link pubfood/model.Slot}
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

AuctionMediator.prototype.updateSlotBidProviders = function(slot) {

  var providers = slot.bidProviders || {};

  for (var k in providers) {
    var providerName = k;

    this.slotMap.providers[providerName] = this.slotMap.providers[providerName] || {};

    this.slotMap.slots[slot.name][providerName] = this.slotMap.providers[providerName];
  }
};

/**
 * Add a [BidProvider]{@link pubfood/provider.BidProvider} configuration object.
 * @param {BidDelegate} delegateConfig - configuration for a [BidProvider]{@link pubfood/provider.BidProvider}
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
 * Add a [AuctionProvider]{@link pubfood/provider.AuctionProvider} configuration object.
 * @param {object} bidProviderConfig - configuration for a [AuctionProvider]{@link pubfood/provider.AuctionProvider}
 */
AuctionMediator.prototype.setAuctionProvider = function(delegateConfig) {
  var  auctionProvider = AuctionProvider.withDelegate(delegateConfig);
  this.auctionProvider = auctionProvider;
  return this.auctionProvider;
};

/**
 * request operator callback
 *
 * @callback requestOperatorCallback
 * @param {*} data
 * @return {boolean}
 */

/**
 * transform operator callback
 *
 * @callback transformOperatorCallback
 * @param {*} data
 * @return {boolean}
 */

/**
 * done callback
 *
 * @callback doneCallback
 * @return {undefined}
 */

/**
 *
 * @param {requestOperatorCallback} cb
 * @return {pubfood}
 */
AuctionMediator.prototype.addRequestOperator = function(cb){

};

/**
 *
 * @param {transformOperatorCallback} cb
 * @return {pubfood}
 */
AuctionMediator.prototype.addTransformOperator = function(){

};

/**
 * Load bid provider JavaScript library/tag.
 */
AuctionMediator.prototype.loadProviders = function(action) {
  var loadedBidders = 0;
  function bidderLoaded() {
    loadedBidders++;
  }

  for (var k in this.bidProviders) {
    if (this.bidProviders[k].libUri) {
      var uri = this.bidProviders[k].libUri() || '';
      util.loadUri(uri);
    }
  }

  if (this.auctionProvider && this.auctionProvider.libUri()) {
    var uri = this.auctionProvider.libUri();
    window.googletag.cmd.push(bidderLoaded);

    util.loadUri(uri);
  }
};

/**
 * Get bid providers for the given slot name.
 *
 * @param {string} slotName - name of the slot
 */
AuctionMediator.prototype.getSlotBidders = function (slotName) {
  return this.slotMap.slots[slotName] || {};
};

/**
 * Start auction bidding.
 */
AuctionMediator.prototype.start = function() {
  this.init();

  this.bidMediator = new BidMediator(this);

  this.loadProviders();
  this.bidMediator.initBids(this.slots);
};

AuctionMediator.prototype.refresh = function(slotNames) {
  var slots = [];
  this.bidMediator.refreshBids(slots);
};
module.exports = AuctionMediator;
