/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');

/**
 * BidProvider implements bidding partner requests.
 *
 * @class
 * @memberof pubfood/provider
 */
function BidProvider() {
  this.name;
}

/**
 * Create a new [BidProvider]{@link pubfood/provider.BidProvider} from a delegate object.
 *
 * @param {object} delegate - bid provider delegate object literal
 * @returns {object} instance of [BidProvider]{@link pubfood/provider.BidProvider}. <em>null</em> if delegate is invalid.
 */
BidProvider.withDelegate = function(delegate) {
  if (!BidProvider.validate(delegate)) {
    return null;
  }
  var p = new BidProvider();
  p.name = delegate.name;
  p.bidDelegate = delegate;
  return p;
};


var bidDelegate = require('../interfaces').BidDelegate;
/**
 * Validate a bid provider delegate.
 *
 * @param {object} delegate - bid provider delegate object literal
 * @returns {boolean} true if delegate has required functions and properties
 */
BidProvider.validate = function(delegate) {
  if (!delegate) return false;

  var err = 0;
  for (var k in bidDelegate) {
    if (!delegate.hasOwnProperty(k) || util.asType(delegate[k]) !== util.asType(bidDelegate[k])) {
      err++;
    }
    if (err > 0) break;
  }
  return !err;
};

/**
 * Get or set the provider JavaScript library Uri.
 *
 * @param {string} [uri] location Uri
 * @returns {string} location Uri
 */
BidProvider.prototype.libUri = function(uri) {
  var args = Array.prototype.slice.call(arguments);
  if (args.length > 0 && util.asType(args[0]) === 'string') {
    this.bidDelegate.libUri = args[0];
  }
  return this.bidDelegate.libUri;
};

/**
 * Initialize a bid provider.
 *
 * The BidProvider delegate javascript tag and other setup is done here.
 *
 * Delegates to implementation [BidDelegate.init]{@link pubfood/interfaces.BidDelegate}
 *
 * @param {array} slots - delegate specific options
 * @param {object} options - provider delegate specific bid options
 * @param {function} done - a callback to execute on init complete
 * @return {undefined}
 */
BidProvider.prototype.init = function(slots, options, done) {
  this.bidDelegate.init(slots, options, done);
};

/**
 * Refresh bids for ad slots
 *
 * @param {object[]} slots - delegate specific options
 * @param {string} slots[].name -
 * @param {object.<string, *>} options -  - provider delegate specific bid options
 * @param {module:pubfood~doneCallback} done - a callback to execute on init complete
 * @return {undefined}
 */
BidProvider.prototype.refresh = function(slots, options, next, done) {
  this.bidDelegate.refresh(slots, options, next, done);
};

module.exports = BidProvider;
