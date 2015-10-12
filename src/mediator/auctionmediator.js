/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var Slot = require('../model/slot');
var BidMediator = require('./bidmediator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');

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
  this.bidProviders = [];
  this.auctionProvider = null;
  this.bidMediator = null;
}

AuctionMediator.prototype.init = function() {
};

/**
 * Add a [Slot]{@link pubfood/model.Slot} to [AuctionMediator]{@link pubfood/mediator.AuctionMediator} config.
 * @param {object} slotConfig - configuration for a [Slot]{@link pubfood/model.Slot}
 */
AuctionMediator.prototype.addSlot = function(slotConfig) {

  var slot = Slot.fromObject(slotConfig);
  if (slot) {
    this.slots.push(slot);
  }
  return this;
};

/**
 * Add a [BidProvider]{@link pubfood/provider.BidProvider} configuration object.
 * @param {object} delegateConfig - configuration for a [BidProvider]{@link pubfood/provider.BidProvider}
 */
AuctionMediator.prototype.addBidProvider = function(delegateConfig) {
  if (BidProvider.validate(delegateConfig)) {
    var bidProvider = BidProvider.withDelegate(delegateConfig);
    this.bidProviders.push(bidProvider);
  }
  return this;
};

/**
 * Add a [AuctionProvider]{@link pubfood/provider.AuctionProvider} configuration object.
 * @param {object} bidProviderConfig - configuration for a [AuctionProvider]{@link pubfood/provider.AuctionProvider}
 */
AuctionMediator.prototype.setAuctionProvider = function(auctionProviderConfig) {

  return this;
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
 * Start auction bidding.
 */
AuctionMediator.prototype.start = function() {
  this.bidMediator = new BidMediator();
  this.bidMediator.addBidProviders(this.bidProviders);

  this.bidMediator.loadProviders();
  this.bidMediator.initBids(this.slots);

  this.auctionProvider = new AuctionProvider({});
};

AuctionMediator.prototype.refresh = function(slotNames) {
  var slots = [];
  this.bidMediator.refreshBids(slots);
};
module.exports = AuctionMediator;
