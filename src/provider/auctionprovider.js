/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');
var AuctionDelegate = require('../interfaces').AuctionDelegate;
var Event = require('../event');

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
    Event.publish(Event.EVENT_TYPE.INVALID, {msg: 'Warn: invalid auction delegate - ' + (delegate && JSON.stringify(delegate)) || ''});
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
 * @param {object[]} slotTargeting - slot objects with bids and page level targeting
 * @param {string} slotTargeting.name slot name
 * @param {string} slotTargeting.elementId target DOM elementId
 * @param {array} slotTargeting.sizes slot sizes
 * @param {object} slotTargeting.targeting slot targeting key value pairs
 * @param {auctionDoneCallback} done - a callback to execute on init complete
 * @return {undefined}
 */
AuctionProvider.prototype.init = function(slotTargeting, done) {
  this.auctionDelegate.init(slotTargeting, done);
};

/**
 * Refresh for ad slots
 *
 * @param {object[]} slotTargeting objects with bids and page level targeting
 * @param {string} slotTargeting.name slot name
 * @param {string} slotTargeting.elementId target DOM elementId
 * @param {array} slotTargeting.sizes slot sizes
 * @param {object} slotTargeting.targeting slot targeting key value pairs
 * @param {auctionDoneCallback} done a callback to execute on init complete
 * @return {undefined}
 */
AuctionProvider.prototype.refresh = function(slotTargeting, done) {
  this.auctionDelegate.refresh(slotTargeting, done);
};

module.exports = AuctionProvider;
