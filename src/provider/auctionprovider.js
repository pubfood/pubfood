/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var AuctionDelegate = require('../interfaces').AuctionDelegate;

/**
 * AuctionProvider implements the publisher ad server requests.
 *
 * @class
 * @memberof pubfood#provider
 * @param {AuctionDelegate} auctionDelegate
 */
function AuctionProvider(auctionDelegate) {
  this.name = auctionDelegate.name || '';
  this.slots_ = [];
  this.auctionDelegate = auctionDelegate;
  this.mediator = null;
}

/**
 * Set the central auction mediator that orchestrates the auctions.
 *
 * @param {AuctionMediator} mediator - the auction mediator
 */
AuctionProvider.prototype.setMediator = function(mediator) {
  this.mediator = mediator;
};

/**
 * Create a new [AuctionProvider]{@link pubfood#provider.AuctionProvider} from an object.
 *
 * @param {AuctionDelegate} delegate - provider object literal
 * @returns {pubfood#provider.AuctionProvider|null} instance of [AuctionProvider]{@link pubfood#provider.AuctionProvider}. <em>null</em> if delegate is invalid.
 */
AuctionProvider.withDelegate = function(delegate) {
  if (!AuctionProvider.validate(delegate)) {
    return null;
  }
  var p = new AuctionProvider(delegate);
  return p;
};

/**
 * Validate a auction provider delegate.
 *
 * Checks that the delegate has the require properties specified by {@link AuctionDelegate}
 *
 * @param {AuctionDelegate} delegate - bid provider delegate object literal
 * @returns {boolean} true if delegate has required functions and properties
 */
AuctionProvider.validate = function(delegate) {
  return util.validate(AuctionDelegate, delegate);
};

/**
 * Auction provider delegate options.
 * @returns {object} options
 */
AuctionProvider.prototype.getOptions = function() {
  return this.auctionDelegate.options || {};
};

/**
 * Set the provider's name.
 *
 * @param {string} name - the auction provider name
 * @return {pubfood#provider.AuctionProvider}
 */
AuctionProvider.prototype.setName = function(name) {
  this.name = name;
  return this;
};

/**
 * Get the auction provider's libUri
 * @todo maybe change to getLibUri
 *
 * @return {string}
 */
AuctionProvider.prototype.libUri = function() {
  return this.auctionDelegate.libUri;
};

/**
 * Initialize a auction provider.
 *
 * The AuctionProvider delegate javascript tag and other setup is done here.
 *
 * @param {object[]} slots - slot objects with bids and page level targeting
 * @param {string} slots.name slot name
 * @param {string} slots.elementId target DOM elementId
 * @param {array} slots.sizes slot sizes
 * @param {object} slots.targeting slot targeting key value pairs
 * @param {object} options - AuctionProvider delegate specific options
 * @param {auctionDoneCallback} done - a callback to execute on init complete
 * @return {undefined}
 */
AuctionProvider.prototype.init = function(slots, options, done) {
  this.auctionDelegate.init(slots, options, done);
};

/**
 * Refresh for ad slots
 *
 * @param {object[]} slots objects with bids and page level targeting
 * @param {string} slots.name slot name
 * @param {string} slots.elementId target DOM elementId
 * @param {array} slots.sizes slot sizes
 * @param {object} slots.targeting slot targeting key value pairs
 * @param {object} options AuctionProvider delegate specific options
 * @param {auctionDoneCallback} done a callback to execute on init complete
 * @return {undefined}
 */
AuctionProvider.prototype.refresh = function(slots, options, done) {
  this.auctionDelegate.refresh(slots, options, done);
};

module.exports = AuctionProvider;
