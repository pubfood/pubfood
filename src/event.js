/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
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
 * @memberof pubfood
 * @return {pubfood.PubfoodEvent}
 */
function PubfoodEvent() {
  // PubfoodEvent constructor
}

/**
 * @type {object}
 * @description Available event types
 */
PubfoodEvent.prototype.EVENT_TYPE = {
  /**
   * Api library load
   * @event pubfood.PubfoodEvent.PUBFOOD_API_LOAD
   */
  PUBFOOD_API_LOAD: 'pubfoodapiload',
  /**
   * Api library start
   * @event pubfood.PubfoodEvent.PUBFOOD_API_START
   */
  PUBFOOD_API_START: 'pubfoodapistart',
  /**
   * Bid provider library load started
   * @event pubfood.PubfoodEvent.BID_LIB_START
   */
  BID_LIB_START: 'bplibstart',
  /**
   * Bid provider library loaded
   * @event pubfood.PubfoodEvent.BID_LIB_LOADED
   */
  BID_LIB_LOADED: 'bplibloaded',
  /**
   * Action started.<br>e.g [BidProvider.init]{@link pubfood/provider.BidProvider#init}
   * @event pubfood.PubfoodEvent.BID_START
   */
  BID_START: 'bidstart',
  /**
   *  Next item in data stream ready.<br>
   *  e.g [BidProvider.refresh]{@link pubfood/provider.BidProvider#init} raises
   *  a [NEXT]{@link pubfood/events.EVENT_TYPE.NEXT} event for each bid.
   * @event pubfood.PubfoodEvent.BID_NEXT
   */
  BID_NEXT: 'bidnext',
  /**
   * Action is complete
   * @event pubfood.PubfoodEvent.BID_COMPLETE
   */
  BID_COMPLETE: 'bidcomplete',
  /**
   * Auction provider library load started
   * @event pubfood.PubfoodEvent.AUCTION_LIB_START
   */
  AUCTION_LIB_START: 'aplibstart',
  /**
   * Auction provider library loaded
   * @event pubfood.PubfoodEvent.AUCTION_LIB_LOADED
   */
  AUCTION_LIB_LOADED: 'aplibloaded',
  /**
   * Start the publisher auction
   * @event pubfood.PubfoodEvent.AUCTION_GO
   */
  AUCTION_GO: 'auctiongo',
  /**
   * The auction was restarted
   * @event pubfood.PubfoodEvent.AUCTION_REFRESH
   */
  AUCTION_REFRESH: 'auctionrefresh',
  /**
   * The auction has completed
   * @event pubfood.PubfoodEvent.AUCTION_COMPLETE
   */
  AUCTION_COMPLETE: 'auctioncomplete',
  /**
   * Error event raised
   * @event pubfood.PubfoodEvent.ERROR
   */
  ERROR: 'error'
};

/**
 * publish an event
 * @param {string} eventType The event type
 * @param {*} data the event data
 * @param {string} providerType The type of provider. ex: <i>bid</i>, <i>auction</i>
 * @return {boolean} Indication if we've emitted an event.
 */
PubfoodEvent.prototype.publish = function(eventType, data, providerType) {
  var ts = (+new Date());

  if(eventType === this.EVENT_TYPE.PUBFOOD_API_START && data){
    ts = data;
  }

  logger.logEvent(eventType, arguments);

  return this.emit(eventType, {
    ts: ts,
    type: eventType,
    provider: providerType || 'pubfood',
    data: data || ''
  });
};

/**
 * Emit an event to all registered event listeners.
 * @function emit
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Register a new EventListener for the given event.
 * @function on
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Add an EventListener that's only called once.
 * @function once
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Remove event listeners.
 * @function removeListener
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Remove all listeners or only the listeners for the specified event.
 * @function removeAllListeners
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 */

/**
 * Return a list of assigned event listeners.
 * @function listeners
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 */

/**
 * @typedef {object} EventStructure
 * @memberof pubfood.PubfoodEvent
 * @property {string} ts The timestamp of the event
 * @property {string} type The event type
 * @property {string} provider The type of provider. Defaults to <i>pubfood</i>
 * @property {object|string} data Data structure for each event type
 * @property {string} data.PUBFOOD_API_LOAD
 * @property {string} data.PUBFOOD_API_START
 * @property {object} data.ERROR
 * @property {*} data.ERROR.stackTrace
 * @property {object} data.AUCTION_LIB_START
 * @property {string} data.AUCTION_LIB_START.auctionProvider
 * @property {object} data.AUCTION_LIB_LOADED
 * @property {string} data.AUCTION_LIB_LOADED.auctionProvider
 * @property {string} data.AUCTION_GO
 * @property {string} data.AUCTION_REFRESH
 * @property {string} data.AUCTION_COMPLETE
 * @property {string} data.BID_LIB_START
 * @property {string} data.BID_LIB_LOADED
 * @property {object} data.BID_NEXT
 * @property {string} data.BID_NEXT.id
 * @property {array.<number, number>} data.BID_NEXT.sizes
 * @property {string} data.BID_NEXT.value
 * @property {object} data.BID_NEXT.customTargetting
 * @property {string} data.BID_START
 * @property {string} data.BID_COMPLETE
 */

util.extends(PubfoodEvent, EventEmitter);
module.exports = new PubfoodEvent();
