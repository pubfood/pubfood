/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Events live here..
 */

'use strict';

/*eslint no-unused-vars: 0*/

var EventEmitter = require('eventemitter3');

/**
 * Event type
 *
 * @typedef {object} ERROR
 * @property {string} ts
 * @property {string} message
 * @property {*} stackTrace
 */

/**
 * Event type
 *
 * @typedef {object} AUCTION_LIB_START
 * @property {string} ts
 * @property {string} auctionProvider
 */

/**
 * Event type
 *
 * @typedef {object} AUCTION_LIB_LOADED
 * @property {string} ts
 * @property {string} auctionProvider
 */

/**
 * Event type
 *
 * @typedef {object} AUCTION_GO
 * @property {string} ts
 */

/**
 * Event type
 *
 * @typedef {object} BID_LIB_START
 * @property {string} ts
 * @property {string} bidProvider
 */

/**
 * Event type
 *
 * @typedef {object} BID_LIB_LOADED
 * @property {string} ts
 * @property {string} bidProvider
 */

/**
 * Event type
 *
 * @typedef {object} BID_NEXT
 * @property {string} id
 * @property {string} ts
 * @property {array.<number, number>} sizes
 * @property {string} value
 * @property {object} customTargetting
 */

/**
 * Event type
 *
 * @typedef {object} BID_START
 * @property {string} ts
 * @property {string} bidProvider
 */

/**
 * Event type
 *
 * @typedef {object} BID_COMPLETE
 * @property {string} ts
 * @property {string} bidProvider
 */

/**
 * Pubfood event class
 * @param {string} type - the event type
 * @param {object} [data] - event payload
 * @param {number} [ts] - event timestamp
 * @class
 * @memberof pubfood
 */
function PubfoodEvent(type, data, ts) {
  this.type = type || 'error';
  this.data = data || {};
  this.ts = ts || Date.now();
}

/**
 * Set the event timestamp to now().
 */
PubfoodEvent.prototype.now = function() {
  this.ts = Date.now();
};

PubfoodEvent.prototype.setTimestamp = function(millis) {
  this.ts = millis;
};

PubfoodEvent.prototype.setData = function(data) {
  this.data = data;
};

function bindContext(emitter, data) {
  return {eventEmitter: emitter, data: data};
}

var events = {
  /**
   * @enum {string}
   * @memberof pubfood/events
   */
  EVENT_TYPE: {
    /**
     * Bid provider library load started
     */
    BID_LIB_START: 'bplibstart',
    /**
     * Bid provider library loaded
     */
    BID_LIB_LOADED: 'bplibloaded',
    /**
     * Action started
     *
     * e.g [BidProvider.init]{@link pubfood/provider.BidProvider#init}
     **/
    BID_START: 'bidstart',
    /**
     * Next item in data stream ready
     *
     * e.g [BidProvider.refresh]{@link pubfood/provider.BidProvider#init} raises a [NEXT]{@link pubfood/events.EVENT_TYPE.NEXT}
     * event for each bid.
     **/
    BID_NEXT: 'bidnext',
    /**
     * Action is complete
     **/
    BID_COMPLETE: 'bidcomplete',
    /**
     * Auction provider library load started
     */
    AUCTION_LIB_START: 'aplibstart',
    /**
     * Auction provider library loaded
     */
    AUCTION_LIB_LOADED: 'aplibloaded',
    /**
     * Publisher auction complete
     */
    AUCTION_COMPLETE: 'auctioncomplete',
    /**
     * Publisher auction startede
     */
    AUCTION_START: 'auctionstart',
    /**
     * Start the publisher auction
     */
    AUCTION_GO: 'auctiongo',
    /**
     * Error event raised
     **/
    ERROR: 'error'
  },
  PubfoodEvent: PubfoodEvent,
  bindContext: bindContext
};

module.exports = events;
