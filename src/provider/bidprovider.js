/**
 * pubfood
 */

'use strict';

var util = require('../util');
var BidDelegate = require('../interfaces').BidDelegate;
var Event = require('../event');

/**
 * BidProvider implements bidding partner requests.
 *
 * @class
 * @memberof pubfood#provider
 * @param {BidDelegate} delegate
 */
function BidProvider(delegate) {
  this.name = delegate.name || '';
  this.bidDelegate = delegate;
}

/**
 * Create a new [BidProvider]{@link pubfood#provider.BidProvider} from a delegate object.
 *
 * @param {BidDelegate} delegate - bid provider delegate object literal
 * @returns {pubfood#provider.BidProvider|null} instance of [BidProvider]{@link pubfood#provider.BidProvider}. <em>null</em> if delegate is invalid.
 */
BidProvider.withDelegate = function(delegate) {
  if (!BidProvider.validate(delegate)) {
    Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: invalid bidder delegate - ' + delegate || ''});
    return null;
  }
  var p = new BidProvider(delegate);
  return p;
};


/**
 * Validate a bid provider's delegate.
 *
 * @param {BidDelegate} delegate - bid provider delegate object literal
 * @returns {boolean} true if delegate has required functions and properties
 */
BidProvider.validate = function(delegate) {
  return util.validate(BidDelegate, delegate);
};

/**
 * Get or set the provider JavaScript library Uri.
 *
 * @param {string} uri location Uri
 * @returns {string} location Uri
 */
BidProvider.prototype.libUri = function(uri) {
  if (uri) {
    this.bidDelegate.libUri = uri;
  }
  return this.bidDelegate.libUri;
};

/**
 * Get or set the provider to load it's library either sync or async.
 *
 * @param {boolean} [loadSync] when true load the library in a sync fashion
 * @returns {boolean} true if the library should load sync
 */
BidProvider.prototype.sync = function(/*loadSync*/) {
  var args = Array.prototype.slice.call(arguments);
  if (args.length > 0 && util.asType(args[0]) === 'boolean') {
    this.bidDelegate.sync = args[0];
  }
  return !!this.bidDelegate.sync;
};

/**
 * Initialize a bid provider.
 *
 * The BidProvider delegate javascript tag and other setup is done here.
 *
 * Delegates to implementation [BidDelegate.init]{@link pubfood#interfaces.BidDelegate}
 *
 * @param {Slot[]} slots slots to bid on
 * @param {pushBidCallback} pushBid - callback that registers the bid; execute callback for each bid object
 * @param {bidDoneCallback} done - a callback to execute on init complete
 */
BidProvider.prototype.init = function(slots, pushBid, done) {
  this.bidDelegate.init(slots, pushBid, done);
};

/**
 * Refresh bids for ad slots
 *
 * @param {Slot[]} slots slots to bid on
 * @param {pushBidCallback} pushBid - callback that registers the bid; execute callback for each bid object
 * @param {bidDoneCallback} done - a callback to execute on init complete
 */
BidProvider.prototype.refresh = function(slots, pushBid, done) {
  this.bidDelegate.refresh(slots, pushBid, done);
};

module.exports = BidProvider;
