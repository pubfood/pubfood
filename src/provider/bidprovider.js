/**
 * pubfood
 */

'use strict';

var util = require('../util');
var BidDelegate = require('../interfaces').BidDelegate;
var Event = require('../event');
var PubfoodProvider = require('./pubfoodprovider');

/**
 * BidProvider implements bidding partner requests.
 *
 * @class
 * @param {BidDelegate} delegate the delegate object that implements [libUri()]{@link pubfood#provider.BidProvider#libUri}, [init()]{@link pubfood#provider.BidProvider#init} and [refresh()]{@link pubfood#provider.BidProvider#refresh}
 * @property {string} name the name of the provider
 * @augments PubfoodObject
 * @augments PubfoodProvider
 * @memberof pubfood#provider
 */
function BidProvider(bidDelegate) {
  if (this.init_) {
    this.init_();
  }
  var delegate = bidDelegate || {};
  this.name = delegate.name || '';
  this.bidDelegate = delegate;
  this.enabled_ = true;
  this.timeout_ = delegate && delegate.timeout ? delegate.timeout : 0;
}

/**
 * Create a new [BidProvider]{@link pubfood#provider.BidProvider} from a delegate object.
 *
 * @param {BidDelegate} delegate - bid provider delegate object literal
 * @returns {pubfood#provider.BidProvider|null} instance of [BidProvider]{@link pubfood#provider.BidProvider}. <em>null</em> if delegate is invalid.
 * @private
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
 * @private
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
  var refresh = (this.bidDelegate && this.bidDelegate.refresh) || null;
  if (!refresh) {
    var msg = 'BidProvider.bidDelegate.refresh not defined.';
    Event.publish(Event.EVENT_TYPE.WARN, msg);
    if (util.asType(done) === 'function') {
      var errorAnnotation = Event.newEventAnnotation(Event.ANNOTATION_TYPE.FORCED_DONE.NAME, Event.ANNOTATION_TYPE.FORCED_DONE.ERROR, msg);
      done(errorAnnotation);
    }
    return;
  }
  refresh(slots, pushBid, done);
};

/**
 * Get or set the bid provider enabled status.
 *
 * Bid providers are enabled to be part of auction bid requests by default.<p>
 * If a bid provider is not to be included in an auction `init` or `refresh` request,<br>
 * the bid provider may be disabled to prevent the provider bid request.
 * @param {boolean} [status] set the enabled status of the provider true|false
 * @returns {boolean} true if enabled for bid requests, false otherwise.
 */
BidProvider.prototype.enabled = function(status) {
  if (util.asType(status) === 'boolean') {
    this.enabled_ = status;
  }
  return this.enabled_;
};

/**
 * Set the timeout by which a bid provider must call done
 * @param {number} millis the millisecond duration the bid provider has to push bids
 */
BidProvider.prototype.timeout = function(millis) {
  this.timeout_ = util.asType(millis) === 'number' ? millis : 0;
};

/**
 * Get the timeout by which a bid provider must call done
 * @return {number} the millisecond duration the bid provider has to push bids
 */
BidProvider.prototype.getTimeout = function() {
  return this.timeout_;
};

util.extends(BidProvider, PubfoodProvider);
module.exports = BidProvider;
