/**
 * pubfood
 *
 * Events live here..
 */

'use strict';

var util = require('./util');
var logger = require('./logger');
var EventEmitter = require('eventemitter3');

/**
 * Pubfood event class
 * @class
 * @property {string} ts The timestamp of the event
 * @property {string} type The event type
 * @property {string} provider The type of provider. Defaults to <i>pubfood</i>
 * @property {object|string} data Data structure for each event type
 * @return {PubfoodEvent}
 * @extends EventEmitter
 * @see https://github.com/primus/eventemitter3
 */
function PubfoodEvent() {
  this.auction_ = 1;
  /**
   * Map of emitted events without registered handlers.
   *
   * @private
   */
  this.observeImmediate_ = {};
  // PubfoodEvent constructor
}

/**
 * @description Available event types
 */
PubfoodEvent.prototype.EVENT_TYPE = {
  /**
   * Api library load
   * @event PubfoodEvent.PUBFOOD_API_LOAD
   * @private
   */
  PUBFOOD_API_LOAD: 'PUBFOOD_API_LOAD',
  /**
   * Api library start
   * @event PubfoodEvent.PUBFOOD_API_START
   * @property {number} data api start timestamp
   * @private
   */
  PUBFOOD_API_START: 'PUBFOOD_API_START',
  /**
   * Bid provider library load started
   * @event PubfoodEvent.BID_LIB_START
   * @private
   */
  BID_LIB_START: 'BID_LIB_START',
  /**
   * Bid provider library loaded
   * @event PubfoodEvent.BID_LIB_LOADED
   * @property {string} data [BidProvider.name]{@link pubfood#provider.BidProvider}
   * @private
   */
  BID_LIB_LOADED: 'BID_LIB_LOADED',
  /**
   * Action started.<br>e.g [BidProvider.init]{@link pubfood/provider.BidProvider#init}
   * @event PubfoodEvent.BID_START
   * @property {string} data [BidProvider.name]{@link pubfood#provider.BidProvider}
   */
  BID_START: 'BID_START',
  /**
   *  Next item in data stream ready.
   *
   * @event PubfoodEvent.BID_PUSH_NEXT
   * @property {object} data @see [Bid]{@link pubfood#model.Bid}
   * @property {string} data.id
   * @property {array.<number, number>} data.sizes
   * @property {string} data.value
   * @property {object} data.targeting
   * @private
   */
  BID_PUSH_NEXT: 'BID_PUSH_NEXT',
  /**
   * Action is complete
   * @event PubfoodEvent.BID_COMPLETE
   * @property {string} data [BidProvider.name]{@link pubfood#provider.BidProvider}
   */
  BID_COMPLETE: 'BID_COMPLETE',
  /**
   * Start bid assembler
   * @event PubfoodEvent.BID_ASSEMBLER
   * @property {Bid[]} data bid objects with potentially custom properties.
   * See also [TransformOperator]{@link pubfood#assembler.TransformOperator}
   * @private
   */
  BID_ASSEMBLER: 'BID_ASSEMBLER',
  /**
   * Auction provider library load started
   * @event PubfoodEvent.AUCTION_LIB_START
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   * @private
   */
  AUCTION_LIB_START: 'AUCTION_LIB_START',
  /**
   * Auction provider library loaded
   * @event PubfoodEvent.AUCTION_LIB_LOADED
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   * @private
   */
  AUCTION_LIB_LOADED: 'AUCTION_LIB_LOADED',
  /**
   * Start the publisher auction
   * @event PubfoodEvent.AUCTION_GO
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   */
  AUCTION_GO: 'AUCTION_GO',
  /**
   * Start the publisher auction from a business rule.
   * e.g. a bidder timeout
   * @event PubfoodEvent.AUCTION_TRIGGER
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   * @private
   */
  AUCTION_TRIGGER: 'AUCTION_TRIGGER',
  /**
   * The auction was restarted
   * @event PubfoodEvent.AUCTION_REFRESH
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   * @private
   */
  AUCTION_REFRESH: 'AUCTION_REFRESH',
  /**
   * The auction has completed
   * @event PubfoodEvent.AUCTION_COMPLETE
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   */
  AUCTION_COMPLETE: 'AUCTION_COMPLETE',
  /**
   * The auction has finished running
   * @event PubfoodEvent.AUCTION_POST_RUN
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   * @private
   */
  AUCTION_POST_RUN: 'AUCTION_POST_RUN',
  /**
   * Error event raised
   * @event PubfoodEvent.ERROR
   * @property {PubfoodError} data
   * @property {string} data.message
   * @property {string} data.stack
   */
  ERROR: 'ERROR',
  /**
   * Warn event raised
   * @event PubfoodEvent.WARN
   * @property {string} data the warning message
   */
  WARN: 'WARN',
  /**
   * Invalid operation or data event raise
   * @event PubfoodEvent.INVALID
   * @property {string} data description message
   */
  INVALID: 'INVALID'
};

/**
 * publish an event
 * @param {string} eventType The event type
 * @param {*} data the event data
 * @param {string} eventContext The type of provider. ex: <i>bid</i>, <i>auction</i>
 * @return {boolean} Indication if we've emitted an event.
 */
PubfoodEvent.prototype.publish = function(eventType, data, eventContext) {
  var ts = (+new Date());

  if (eventType === this.EVENT_TYPE.PUBFOOD_API_START && data) {
    ts = data;
  }

  logger.logEvent(eventType, arguments);

  return this.emit(eventType, {
    ts: ts,
    type: eventType,
    eventContext: eventContext || 'pubfood',
    data: data || ''
  });
};

util.extends(PubfoodEvent, EventEmitter);

/**
 * Emit event, but keep events without a registered listener.
 *
 * Emitted events without a listener are stored as events to
 * be immediately observed by listeners; if a listener is added
 * subsequently.
 *
 * @see https://github.com/primus/eventemitter3
 *
 * @param {string} event the event type
 * @return {boolean} - true if the event was emitted. false otherwise.
 * @extends EventEmitter
 * @private
 */
PubfoodEvent.prototype.emit = function(event) {
  var ret = EventEmitter.prototype.emit.apply(this, arguments);

  if (!ret || this.EVENT_TYPE.AUCTION_POST_RUN === event) {
    ret = true;
    this.observeImmediate_[event] = this.observeImmediate_[event] || [];
    this.observeImmediate_[event].push(Array.prototype.slice.call(arguments, 1));
  }
  return ret;
};

/**
 * Register an event listener.
 *
 * Registeres a listener for the event type. If events for the specified type
 * have already been emitted, the registered handler function is invoked immediately.
 *
 * @see https://github.com/primus/eventemitter3
 *
 * @param {string} event the event type
 * @param {function} fn the event handler function
 * @return {PubfoodEvent} - this
 * @extends EventEmitter
 * @private
 */
PubfoodEvent.prototype.on = function(event, fn) {
  var emitted = this.observeImmediate_[event] || null;
  if (emitted) {
    for (var i = 0; i < emitted.length; i++) {
      fn.apply(this, emitted[i]);
    }
    return this;
  }
  return EventEmitter.prototype.on.apply(this, arguments);
};

/**
 * Remove all event listeners.
 *
 * Removes both extended EventEmitter listeners and internal
 * {@link pubfood#PubfoodEvent.emit} immediate listeners.
 *
 * @see https://github.com/primus/eventemitter3
 *
 * @return {PubfoodEvent} - this
 * @extends EventEmitter
 * @private
 */
PubfoodEvent.prototype.removeAllListeners = function() {
  EventEmitter.prototype.removeAllListeners.call(this);

  this.observeImmediate_ = {};

  return this;
};

module.exports = new PubfoodEvent();
