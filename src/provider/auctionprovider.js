/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');

/**
 * AuctionProvider implements the  publisher ad server requests.
 *
 * @class
 * @memberof pubfood#provider
 */
function AuctionProvider(auctionDelegate) {
  this.name = '';
  /** @property {object} - reference to the provider delegate */
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
 * @param {object} delegate - provider object literal
 * @returns {pubfood#provider.AuctionProvider} instance of [AuctionProvider]{@link pubfood#provider.AuctionProvider}
 */
AuctionProvider.withDelegate = function(delegate) {
  if (!AuctionProvider.validate(delegate)) {
    return null;
  }
  var p = new AuctionProvider();
  p.name = delegate.name;
  p.auctionDelegate = delegate;
  return p;
};

var AuctionDelegate = require('../interfaces').AuctionDelegate;
/**
 * Validate a auction provider delegate.
 *
 * @param {object} delegate - bid provider delegate object literal
 * @returns {boolean} true if delegate has required functions and properties
 */
AuctionProvider.validate = function(delegate) {
  if (!delegate) return false;

  var err = 0;
  for (var k in AuctionDelegate) {
    if (!delegate.hasOwnProperty(k) || util.asType(delegate[k]) !== util.asType(AuctionDelegate[k])) {
      err++;
    }
    if (err > 0) break;
  }
  return !err;
};

/**
 * Set the provider name.
 *
 * @param {String} name - the auction provider name
 * @return {pubfood#provider.AuctionProvider}
 */
AuctionProvider.prototype.name = function(name) {
  this.name = name;
  return this;
};

AuctionProvider.prototype.libUri = function() {
  return this.auctionDelegate.libUri;
};

/**
 * Initialize a auction provider.
 *
 * The AuctionProvider delegate javascript tag and other setup is done here.
 *
 * @param {Object} options - AuctionProvider delegate specific options
 * @param {Function} callback - a callback to execute on init complete
 * @return {undefined}
 */
AuctionProvider.prototype.init = function(slots, bids, options, done) {
  this.auctionDelegate.init(slots, bids, options, done);
};

/**
 * Refresh for ad slots
 *
 * @param {string[]} slots
 * @param {object} options
 * @param {function} callback
 * @return {undefined}
 */
AuctionProvider.prototype.refresh = function(slots, bids, options, done) {
  this.auctionDelegate.refresh(slots || {}, options || {}, done);
};

module.exports = AuctionProvider;
