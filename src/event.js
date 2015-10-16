/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Events live here..
 */

'use strict';

var util = require('./util');
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
 * @name pubfood.PubfoodEvent.EVENT_TYPE
 * @property {string} PUBFOOD_API_LOAD Api library load
 * @property {string} PUBFOOD_API_START Api library start
 * @property {string} BID_LIB_START Bid provider library load started
 * @property {string} BID_LIB_LOADED Bid provider library loaded
 * @property {string} BID_START Action started.<br>e.g [BidProvider.init]{@link pubfood/provider.BidProvider#init}
 * @property {string} BID_NEXT Next item in data stream ready.<br>e.g [BidProvider.refresh]{@link pubfood/provider.BidProvider#init} raises a [NEXT]{@link pubfood/events.EVENT_TYPE.NEXT} event for each bid.
 * @property {string} BID_COMPLETE Action is complete
 * @property {string} AUCTION_LIB_START Auction provider library load started
 * @property {string} AUCTION_LIB_LOADED Auction provider library loaded
 * @property {string} AUCTION_GO Start the publisher auction
 * @property {string} AUCTION_REFRESH The auction was restarted
 * @property {string} AUCTION_COMPLETE The auction has completed
 * @property {string} ERROR Error event raised
 */
PubfoodEvent.prototype.EVENT_TYPE = {
  PUBFOOD_API_LOAD: 'pubfoodapiload',
  PUBFOOD_API_START: 'pubfoodapistart',
  BID_LIB_START: 'bplibstart',
  BID_LIB_LOADED: 'bplibloaded',
  BID_START: 'bidstart',
  BID_NEXT: 'bidnext',
  BID_COMPLETE: 'bidcomplete',
  AUCTION_LIB_START: 'aplibstart',
  AUCTION_LIB_LOADED: 'aplibloaded',
  AUCTION_GO: 'auctiongo',
  AUCTION_REFRESH: 'auctionrefresh',
  AUCTION_COMPLETE: 'auctioncomplete',
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
 * @type {object}
 * @name pubfood.PubfoodEvent.EventStructure
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
