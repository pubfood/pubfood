/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Events live here..
 */

'use strict';

var EventEmitter = require('eventemitter3');

/**
 * Events for a BidProvider
 * @class
 */
function BidEvent() {
}

/**
 * Bid started.
 * @event
 * @property {number} timestamp - when the bid started
 */
BidEvent.prototype.start = function() {

};

var events = {
  /**
   * @enum {string}
   * @memberof pubfood/events
   */
  EVENT_TYPE: {
    /**
     * Action started
     *
     * e.g [BidProvider.init]{@link pubfood/provider.BidProvider#init}
     **/
    START: 'start',
    /**
     * Next item in data stream ready
     *
     * e.g [BidProvider.refresh]{@link pubfood/provider.BidProvider#init} raises a [NEXT]{@link pubfood/events.EVENT_TYPE.NEXT}
     * event for each bid.
     **/
    NEXT: 'next',
    /**
     * Action is complete
     **/
    COMPLETE: 'complete',
    /**
     * Error event raised
     **/
    ERROR: 'error'
  },
  createBidEvent: BidEvent
};

module.exports = events;
