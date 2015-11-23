/*! pubfood v0.1.11 | (c) pubfood | http://pubfood.org/LICENSE.txt */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pubfood = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

/**
 * Builds the set of [Bids]{@link pubfood#model.Bid} for a
 * publisher ad server request [AuctionProvider]{@link pubfood#provider.AuctionProvider}.
 *
 * @class
 * @memberof pubfood#assembler
 * @private
 */
function BidAssembler() {
  this.operators = [];
}

/**
 * Add a transform operator to the assembler processing pipeline.
 *
 * @param {TransformOperator} operator - function to transform bids
 *
 */
BidAssembler.prototype.addOperator = function(operator) {
  this.operators.push(operator);
};

/**
 * Process bids.
 *
 * @param {Bid[]} bids - bids to process.
 * @returns {Bid[]} - processed output bids
 */
BidAssembler.prototype.process = function(bids, params) {
  var result = bids;

  for (var i = 0; i < this.operators.length; i++) {
    result = this.operators[i].process(result, params);
  }

  return result;
};

module.exports = BidAssembler;

},{}],3:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

/**
 * Builds the set of [Slot]{@link pubfood#model.Slot} for a
 * publisher ad server request [AuctionProvider]{@link pubfood#provider.AuctionProvider}.
 *
 * @class
 * @memberof pubfood#assembler
 * @private
 */
function RequestAssembler() {
  this.operators = [];
}

/**
 * Add a transform operator to the assembler processing pipeline.
 *
 * @param {TransformOperator} operator - function to transform bids
 *
 */
RequestAssembler.prototype.addOperator = function(operator) {
  this.operators.push(operator);
};

/**
 * Process bids.
 *
 * @param {Slot[]} slots - bids to process.
 * @returns {Slot[]} - processed output bids
 */
RequestAssembler.prototype.process = function(slots, params) {
  var result = slots;

  for (var i = 0; i < this.operators.length; i++) {
    result = this.operators[i].process(result, params);
  }

  return result;
};

module.exports = RequestAssembler;

},{}],4:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var Event = require('../event');
var PubfoodError = require('../errors');

/**
 * TransformOperator processes input bids and outputs result bids.
 *
 * @class
 * @param {TransformDelegate} delegate - function to transform input bids
 * @memberof pubfood#assembler
 */
function TransformOperator(delegate) {
  this.name = 'OP-' + util.newId();
  this.transform = delegate;
}

/**
 * Validate the operator delegate.
 *
 * @param {TransformDelegate} delegate the operator delegate function
 * @return {boolean}
 * @private
 */
TransformOperator.validate = function(delegate) {
  return !!delegate &&  util.asType(delegate) === 'function';
};

/**
 * Create a new TransformOperator with delegate.
 *
 * @param {TransformDelegate} delegate transform object
 * @return {boolean}
 * @private
 */
TransformOperator.withDelegate = function(delegate) {
  if (!TransformOperator.validate(delegate)) return null;

  var t = new TransformOperator(delegate);

  return t;
};

/**
 * Set the operator name.
 * Default name: OP-[uniqueID] e.g. OP-ih47iucugqzlerdpbr
 * @param {string} name the name of the operator
 * @return {TransformOperator}
 */
TransformOperator.prototype.setName = function(name) {
  this.name = name;
  return this;
};

/**
 * Process bids.
 *
 * @param {BidObject[]} bids - bids to process.
 * @param {object} params - parameters as required by delegate function
 * @returns {Bid[]} - processed output bids
 * @private
 */
TransformOperator.prototype.process = function(bids, params) {
  if (!bids) return null;

  var outBids = this.transform(bids, params);

  if (!outBids) {
    Event.publish(Event.EVENT_TYPE.ERROR, new PubfoodError('no transform output'));
  }

  return outBids || null;
};

module.exports = TransformOperator;

},{"../errors":5,"../event":6,"../util":18}],5:[function(require,module,exports){
/**
 * pubfood
 *
 * Errors live here..
 */

'use strict';

var ERR_NAME = 'PubfoodError';
/**
 * Pubfood Error
 * @class
 * @param {string} message - the error description
 * @return {pubfood.PubfoodError}
 */
function PubfoodError(message) {
  this.name = ERR_NAME;
  /** @property {string} message The error message */
  this.message = message || 'Pubfood integration error.';
  /** @property {string} stack The error stack trace */
  this.stack = (new Error()).stack;
}

PubfoodError.prototype = Object.create(Error.prototype);
PubfoodError.prototype.constructor = PubfoodError;
PubfoodError.prototype.name = ERR_NAME;
PubfoodError.prototype.is = function(err) {
  return err && err.name === ERR_NAME;
};

module.exports = PubfoodError;

},{}],6:[function(require,module,exports){
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
 * @return {pubfood.PubfoodEvent}
 */
function PubfoodEvent() {
  this.auction_ = 1;
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

/**
 * Emit an event to all registered event listeners.
 * @function emit
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 * @private
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
 * @private
 */

/**
 * Remove event listeners.
 * @function removeListener
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 * @private
 */

/**
 * Remove all listeners or only the listeners for the specified event.
 * @function removeAllListeners
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 * @private
 */

/**
 * Return a list of assigned event listeners.
 * @function listeners
 * @memberof pubfood.PubfoodEvent
 * @see https://github.com/primus/eventemitter3
 * @private
 */

util.extends(PubfoodEvent, EventEmitter);

PubfoodEvent.prototype.emit = function(event) {
  var ret = EventEmitter.prototype.emit.apply(this, arguments);

  // Always allow AUCTION_POST_RUN events to execute immediately
  // after the emitted event
  if (!ret || this.EVENT_TYPE.AUCTION_POST_RUN === event) {
    ret = true;
    this.observeImmediate_[event] = this.observeImmediate_[event] || [];
    this.observeImmediate_[event].push(Array.prototype.slice.call(arguments, 1));
  }
  return ret;
};

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

module.exports = new PubfoodEvent();

},{"./logger":8,"./util":18,"eventemitter3":1}],7:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

/*eslint no-unused-vars: 0*/

/** @namespace typeDefs */

/**
 * Interface for classes that are delegates for the AuctionProvider decorator..
 *
 * @typedef {AuctionDelegate} AuctionDelegate
 * @property {string} name Auction provider delegate name
 * @property {string} libUri
 * @property {function} init Auction provider delegate initial auction request.<br>Called at startup.
 * @property {array.<SlotTargetingObject>} init.targeting
 * @property {auctionDoneCallback} init.done Callback to execute on done
 * @property {function} [refresh] Auction provider delegate refresh auction request.<br>Called at startup.
 * @property {array.<SlotTargetingObject>} refresh.targeting
 * @property {auctionDoneCallback} refresh.done Callback to execute on done
 * @property {function} [trigger] Auction provider delegate function to trigger the auction. Default: [pubfood.timeout]{@link pubfood#timeout}
 * @property {auctionDoneCallback} trigger.done Callback to initialize the auction provider
 * @memberof typeDefs
 */
var auctionDelegate = {
  name: '',
  libUri: '',
  init: function(targeting, done) {},
  refresh: function(targeting, done) {}
};
auctionDelegate.optional = {
  refresh: true
};

/**
 * Interface for classes that are delegates for the BidProvider decorator.
 *
 * @typedef {BidDelegate} BidDelegate
 * @property {string} name Bid provider delegate name.
 * @property {string} libUri location of the delegate JavaScript library/tag.
 * @property {function} init Initial bid request for [BidProvider.init]{@link pubfood#provider.BidProvider#init} delegate.
 * @property {Slot[]} init.slots slots to bid on
 * @property {pushBidCallback} init.pushBid Callback to execute on next bid available
 * @property {bidDoneCallback} init.done Callback to execute on done
 * @property {function} [refresh] Refresh bids for [BidProvider.refresh]{@link pubfood#provider.BidProvider#refresh} delegate.
 * @property {Slot[]} refresh.slots slots to bid on
 * @property {pushBidCallback} refresh.pushBid Callback to execute on next bid available
 * @property {bidDoneCallback} refresh.done Callback to execute on done
 * @memberof typeDefs
 */
var bidDelegate = {
  name: '__default__',
  libUri: ' ',
  init: function(slots, pushBid, done) {
    done();
  },
  refresh: function(slots, pushBid, done) {
    done();
  }
};
bidDelegate.optional = {
  refresh: true
};

/**
 * Function delegates for the [TransformOperator]{@link pubfood#assembler.TransformOperator} decorator.
 * @typedef {function} TransformDelegate
 * @param {Bid[]} bids array of bids to transform
 * @param {object} params parameters as required by delegate function. Future use.
 * @returns {Bid[]|null}
 * @example
 *   var transformDelegate = function(bids, params) { console.log('operate on bids'); };
 * @memberof typeDefs
 */
var transformDelegate = function(bids, params) {
};

/**
 * Auction trigger function.
 *
 * A custom function that can be registered with an [AuctionMediator]{@link pubfood#mediator.AuctionMediator} that
 * will determine when the publisher ad server request should be initiated.
 *
 * The [start]{@link startAuctionCallback} callback must be invoked to start the auction.
 *
 * @typedef {function} AuctionTriggerFn
 * @param {startAuctionCallback} start callback to initiate the publisher ad server request
 * @memberof typeDefs
 */
var auctionTriggerFunction = function(startAuctionCallback) {
};

/**
 * Start Publisher Ad Server auction request callback.
 *
 * This is the callback passed into the {@link AuctionTriggerFn}.
 *
 * @typedef {function} startAuctionCallback
 * @memberof typeDefs
 */

/**
 * Callback to notify of [BidProvider]{@link pubfood#provider.BidProvider} has its completed bidding process.
 *
 * @typedef {function} bidDoneCallback
 * @fires PubfoodEvent.BID_COMPLETE
 * @memberof typeDefs
 */
var bidDoneCallback = function(){

};

/**
 * Publisher ad server request processing is done.
 *
 * @typedef {function} auctionDoneCallback
 * @fires PubfoodEvent.AUCTION_COMPLETE
 * @memberof typeDefs
 */
var auctionDoneCallback = function(){

};


/**
 * Callback to push bids into the list for publisher ad server auction.
 * @typedef {function} pushBidCallback
 * @param {BidObject} bid the bid object
 * @fires PubfoodEvent.BID_PUSH_NEXT
 * @memberof typeDefs
 */
var pushBidCallback = function(bid){

};

/**
 * Custom reporter.
 * A function that handles reporting of [PubfoodEvent]{@link PubfoodEvent} objects
 * @typedef {function} reporter
 * @param {PubfoodEvent} event the event object
 * @memberof typeDefs
 */
var reporter = function(event){

};

/**
 * Provides information about configuration at start
 *
 * @typedef {function} apiStartCallback
 * @param {boolean} hasErrors true if there are any configuration errors
 * @param {array} errors The list of errors
 * @memberof typeDefs
 */
var apiStartCallback = function(hasErrors, errors){

};

/**
 * Bid object structure for the {@link pushBidCallback}.
 *
 * @typedef {BidObject} BidObject
 * @property {string} slot - slot name
 * @property {string} value - publisher adserver targeting bid value. Default: empty string.
 * @property {array.array.<number, number>} sizes - array of sizes for the slot the bid is for
 * @property {number} sizes.0 width
 * @property {number} sizes.1 height
 * @property {object} [targeting] - key/value pairs for additional adserver targeting
 * @property {string} [label] optional targeting key to use for bid value
 * @memberof typeDefs
 */
var bidObject = {
  slot: '',
  value: '',
  sizes: [],
  targeting: {},
  label: ''
};
bidObject.optional = {
  targeting: true,
  label: true,
  value: true
};

/**
 * @typedef {SlotConfig} SlotConfig
 * @property {string} name name of the slot/ad unit in [AuctionProvider]{@link pubfood#provider.AuctionProvider} system e.g. DFP /accountId/mpu-rt
 * @property {string} [elementId] DOM target element id
 * @property {array.<number, number>} sizes array of slot sizes
 * @property {number} sizes.0 width slot width
 * @property {number} sizes.1 height slot height
 * @property {string[]} bidProviders array of [BidProvider.name]{@link pubfood#provider.BidProvider#name} values
 * @example
 * var slotConfig = {
 *       name: '/abc/123/rectangle',
 *       elementId: 'div-left',
 *       sizes: [ [300, 250], [300, 600] ],
 *       bidProviders: [
 *                       'p1', 'p2'
 *                     ]
 *     };
 * @memberof typeDefs
 */
var slotConfig = {
  name: '',
  elementId: '',
  sizes: [],
  bidProviders: []
};

/**
 * @typedef {BidderSlots} BidderSlots
 *
 * @property {BidProvider} provider
 * @property {Slot[]} slots
 * @memberof typeDefs
 * @private
 */

/**
 * @typedef {SlotTargetingObject} SlotTargetingObject
 *
 * Key value targeting for a specific slot.
 *
 * @property {string} type the targeting level [slot|page]
 * @property {string} [name] the [Slot.name]{@link pubfood#mode.Slot#name} if type is 'slot'
 * @property {string} id the generated identifier of the object
 * @property {string} [elementId] the target DOM element id for the slot
 * @property {array.<number, number>} sizes array of slot sizes
 * @property {object.<string, string>} targeting object containing key/value pair targeting
 * @memberof typeDefs
 */

/**
 *
 * @typedef {PubfoodConfig} PubfoodConfig - all properties are optional
 * @property {string} id
 * @property {number} auctionProviderCbTimeout The maximum time the auction provider has before calling {@link auctionDoneCallback} inside the [AuctionProvider.init]{@link pubfood#provider.AuctionProvider#init} or [AuctionProvider.refresh]{@link pubfood#provider.AuctionProvider#refresh} methods
 * @property {number} bidProviderCbTimeout The maximum time the bid provider has before calling {@link bidDoneCallback} inside the [BidProvider.init]{@link pubfood#provider.BidProvider#init} or [BidProvider.refresh]{@link pubfood#provider.BidProvider#refresh} methods
 * @property {boolean} randomizeBidRequests Randomize the order in which [BidProvider]{@link pubfood#provider.BidProvider} requests are made.
 * @memberof typeDefs
 * @private
 */
var PubfoodConfig = {
  id: '',
  auctionProviderCbTimeout: 2000,
  bidProviderCbTimeout: 2000,
  randomizeBidRequests: false
};

module.exports = {
  BidDelegate: bidDelegate,
  AuctionDelegate: auctionDelegate,
  SlotConfig: slotConfig,
  BidObject: bidObject,
  TransformDelegate: transformDelegate
};

},{}],8:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

/**
 * @memberof pubfood
 * @property {array} history Store the logs
 * @property {function} dumpLog console.logs the history
 * @property {function} logCall Logs every time a given function is called
 * @property {string} logCall.name The function name
 * @property {array} logCall.args The function arguments
 * @property {function} logEvent Logs every time a given event is emitted
 * @property {string} logEvent.name The event name
 * @property {array} logEvent.args The event arguments
 * @private
 */
var logger = {
  auction: 1,
  history: [],
  dumpLog: function(type) {
    if (console && console.log) {
      for (var i = 0; i < this.history.length; i++) {
        var log = this.history[i];
        if(type){
          type = type || '';
          if(type.match(/event/) && log.eventName) {
            console.log(log);
          }
        } else {
          console.log(log);
        }
      }
    }
  },
  logCall: function(name, args) {
    this.history.push({
      ts: (+new Date()),
      auction: this.auction,
      functionName: name,
      args: Array.prototype.slice.call(args)
    });
  },
  logEvent: function(name, args){
    this.history.push({
      ts: (+new Date()),
      auction: this.auction,
      eventName: name,
      args: Array.prototype.slice.call(args)
    });
  }
};

module.exports = logger;

},{}],9:[function(require,module,exports){
/**
 * pubfood
 *
 * Mediators and Assemblers live here..
 */

'use strict';

var AuctionMediator = require('./mediator/auctionmediator');

/**
 * Coordinates and orchestrates Mediator and Assembler instances.
 *
 * @memberof pubfood
 # @private
 */
var mediator = {
  mediatorBuilder: function(config) {
    return new AuctionMediator(config);
  }
};

module.exports = mediator;

},{"./mediator/auctionmediator":10}],10:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var Slot = require('../model/slot');
var BidMediator = require('./bidmediator');
var BidAssembler = require('../assembler/bidassembler');
var RequestAssembler = require('../assembler/requestassembler');
var TransformOperator = require('../assembler/transformoperator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');
var Event = require('../event');

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood#mediator
 * @private
 */
function AuctionMediator(config) {
  if (config && config.optionalId) {
    this.id = config.optionalId;
  }

  /** @property {boolean} prefix if false, do not add bid provider name to bid targeting key. Default: true */
  this.prefix = config && config.hasOwnProperty('prefix') ? config.prefix : true;
  this.bidCount = 0;
  this.slots = [];
  // store slots by name for easy lookup
  this.slotMap = {};
  this.bidProviders = {};
  this.auctionProvider = null;
  this.bids_ = [];
  this.lateBids_ = [];
  this.bidStatus = {};
  this.inAuction = false;
  this.timeout_ = -1;
  this.trigger_ = null;
  this.initDoneTimeout_ = 2000;
  this.processTargetingCounter_ = 0;
  this.bidMediator = new BidMediator(this);
  this.bidAssembler = new BidAssembler();
  this.requestAssembler = new RequestAssembler();
}

/**
 * Initialize the auction
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.init = function() {
  Event.on(Event.EVENT_TYPE.BID_COMPLETE, util.bind(this.checkBids_, this));
  Event.on(Event.EVENT_TYPE.BID_PUSH_NEXT, util.bind(this.pushBid_, this));
  Event.on(Event.EVENT_TYPE.AUCTION_TRIGGER, util.bind(this.triggerAuction_, this));
  return this;
};

/**
 * Validate provider and slot dependencies.
 *
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.validate = function(isRefresh) {
  var isValid = true;
  /* eslint-disable no-unused-vars */
  var refresh = isRefresh || false;
  /* eslint-enable no-unused-vars */

  var tst = {
    hasAuctionProvider: function () {
      return !!this.auctionProvider;
    },
    hasBidProviders: function() {
      var ret = false;
      /* eslint-disable no-unused-vars */
      for (var v in this.bidProviders) {
        ret = true;
        break;
      }
      /* eslint-enable no-unused-vars */
      if (!ret) {
        Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: no bid providers'});
      }
      return ret;
    },
    hasSlots: function() {
      return this.slots.length !== 0;
    },
    hasAllSlotsBidder: function() {
      var noBidders = [];
      for (var i = 0; i < this.slots.length; i++) {
        var slot = this.slots[i];
        if (!slot.bidProviders || !slot.bidProviders[0]) {
          noBidders.push(slot.name);
        }
      }
      if (noBidders.length > 0) {
        Event.publish(Event.EVENT_TYPE.WARN, {msg: 'Warn: no bidders - ' + noBidders.join(', ')});
      }
      return noBidders.length === 0;
    }
  };

  tst.hasBidProviders.warn = true;
  for (var k in tst) {
    isValid = tst[k].call(this);
    isValid = tst[k].warn ? true : isValid;
    if (!isValid) {
      Event.publish(Event.EVENT_TYPE.INVALID, {msg: 'Failed: ' + k});
      break;
    }
  }

  return isValid;
};

/**
 * Sets the time in which bid providers must supply bids.
 *
 * @param {number} millis - milliseconds to set the timeout
 */
AuctionMediator.prototype.timeout = function(millis) {
  this.timeout_ = typeof millis === 'number' ? millis : 2000;
};

/**
 * Gets the time in which bid providers must supply bids.
 *
 * @return {number} the timeout in milliseconds
 */
AuctionMediator.prototype.getTimeout = function() {
  return this.timeout_;
};

/**
 * The maximum time the auction provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setAuctionProviderCbTimeout = function(millis){
  this.initDoneTimeout_ = typeof millis === 'number' ? millis : 2000;
};

/**
 * Force auction provider to init.
 *
 * @param {object}  event
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.setAuctionTrigger = function(triggerFn) {
  this.trigger = triggerFn;
};

/**
 * @private
 */
AuctionMediator.prototype.startAuction_ = function() {
  Event.publish(Event.EVENT_TYPE.BID_ASSEMBLER, 'AuctionMediator');
  this.bidAssembler.process(this.bids_);
  this.go_();
};

/**
 * Start the bid provider timeout.
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.startTimeout_ = function() {
  if (this.timeout_ !== -1 && this.timeout_ >= 0) {
    setTimeout(util.bind(this.startAuction_, this), this.timeout_);
  }
  return this;
};

/**
 * Force auction provider to init.
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.triggerAuction_ = function() {
  if (!this.trigger) {
    this.startTimeout_();
    return;
  }

  function triggerAuction() {
    this.startAuction_();
  }

  this.trigger(util.bind(triggerAuction, this));

  return this;
};

/**
 * Adds bid on {pubfood.PubfoodEvent.BID_PUSH_NEXT} event.
 *
 * @param {object} event event object containing data payload
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.pushBid_ = function(event) {
  if (!this.inAuction) {
    var bid = event.data;
    this.bids_.push(bid);
  } else {
    this.lateBids_.push(event.data);
  }
  return this;
};

/**
 * Check bidder status if all are done.
 *
 * @returns {boolean} true if all bidders are complete. False otherwise.
 *
 */
AuctionMediator.prototype.allBiddersDone = function() {
  var allDone = true;
  for (var provider in this.bidStatus) {
    if (!this.bidStatus[provider]) {
      allDone = false;
      break;
    }
  }
  return allDone;
};

/**
 * Check the bid completion status for all bidder requests.
 *
 * If all bidders are complete, start the auction.
 *
 * @param {PubfoodEvent} event BID_COMPLETE
 * @param {string} event.data the [BidProvider.name]{@link pubfood#provider.BidProvider}
 * @private
 */
AuctionMediator.prototype.checkBids_ = function(event) {
  var provider = event.data;
  this.bidStatus[provider] = true;

  if (this.allBiddersDone()) {
    this.startAuction_();
  }
};

/**
 * Start the auction delegate.
 *
 * @private
 */
AuctionMediator.prototype.go_ = function() {
  if (!this.inAuction) {
    this.inAuction = true;
    this.processTargeting_();
  }
};

AuctionMediator.prototype.getBidKey = function(bid) {
  return (this.prefix && bid.provider ? bid.provider + '_' : '') + (bid.label || 'bid');
};

AuctionMediator.prototype.mergeKeys = function(slotTargeting, bidTargeting) {
  slotTargeting = util.mergeToObject(slotTargeting, bidTargeting);
};

/**
 * Get slot bids.
 *
 * @param {string} slotName name of the slot
 * @return {array} bids for the slot name
 * @private
 */
AuctionMediator.prototype.getSlotBids = function(slotName) {
  var slotBids = [];
  for (var i = 0; i < this.bids_.length; i++) {
    var b = this.bids_[i];
    if (b.slot && b.slot === slotName) {
      slotBids.push(b);
    }
  }
  return slotBids;
};

/**
 * Builds targeting objects for {AuctionDelegate} requests.
 * @private
 * @return {object[]} targeting objects
 */
AuctionMediator.prototype.buildTargeting_ = function() {
  var auctionTargeting = [];
  for (var i = 0; i < this.slots.length; i++) {
    var s = this.slots[i];
    var t = { type: 'slot',
              name: s.name,
              id: s.id,
              elementId: s.elementId || '',
              sizes: s.sizes,
              bids: [],
              targeting: {}
            };

    var slotBids = this.getSlotBids(s.name);
    for (var k = 0; k < slotBids.length; k++) {
      var bid = slotBids[k];
      t.bids.push({
        value: bid.value || '',
        provider: bid.provider,
        id: bid.id,
        targeting: bid.targeting
      });
      var bidKey = this.getBidKey(bid);
      t.targeting[bidKey] = t.targeting[bidKey] || (bid.value || '');
      this.mergeKeys(t.targeting, bid.targeting);
    }

    auctionTargeting.push(t);
  }
  return auctionTargeting;
};

/**
 * process the targeting for the auction provider
 * @private
 */
AuctionMediator.prototype.processTargeting_ = function() {
  var self = this;
  var doneCalled = false;
  var name = self.auctionProvider.name;
  self.processTargetingCounter_++;

  var doneCb = function() {
    if (!doneCalled) {
      doneCalled = true;
      self.auctionDone(name);
    }
  };

  setTimeout(function() {
    if (!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The auction done callback for "' + name + '" hasn\'t been called within the allotted time (' + (self.initDoneTimeout_ / 1000) + 'sec)');
      doneCb();
    }
  }, self.initDoneTimeout_);

  Event.publish(Event.EVENT_TYPE.AUCTION_GO, name);

  var targeting = self.buildTargeting_();
  if (self.processTargetingCounter_ === 1) {
    self.auctionProvider.init(targeting, doneCb);
  } else {
    self.auctionProvider.refresh(targeting, doneCb);
  }
};

/**
 * Notification of auction complete
 *
 * @param {string} data The auction mediator's name
 * @fires AUCTION_COMPLETE
 */
AuctionMediator.prototype.auctionDone = function(data) {
  Event.publish(Event.EVENT_TYPE.AUCTION_COMPLETE, data);
  setTimeout(function() {
    // push this POST event onto the next tick of the event loop
    Event.publish(Event.EVENT_TYPE.AUCTION_POST_RUN, data);
    // TODO consider if delay should be zero or another default
    // TODO consider if delay should be tweakable
  }, 0);
};

/**
 * Add a [Slot]{@link pubfood#model.Slot} to [AuctionMediator]{@link pubfood#mediator.AuctionMediator} config.
 * @param {SlotConfig} slotConfig - configuration for a [Slot]{@link pubfood#model.Slot}
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addSlot = function(slotConfig) {
  var slot = Slot.fromObject(slotConfig);
  if (slot) {
    this.slots.push(slot);
    this.slotMap[slot.name] = slot;
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid slot object: ' + JSON.stringify(slotConfig || {}));
  }
  return this;
};

/**
 * Add a [BidProvider]{@link pubfood#provider.BidProvider} configuration object.
 * @param {BidDelegate} delegateConfig - configuration for a [BidProvider]{@link pubfood#provider.BidProvider}
 * @returns {pubfood#provider.BidProvider}
 */
AuctionMediator.prototype.addBidProvider = function(delegateConfig) {

  var bidProvider = BidProvider.withDelegate(delegateConfig);
  if (bidProvider) {
    if(this.bidProviders[bidProvider.name]){
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: bid provider ' + bidProvider.name + ' is already added');
    } else {
      this.bidProviders[bidProvider.name] = bidProvider;
    }
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid bid provider: ' + delegateConfig.name);
  }
  return bidProvider;
};

AuctionMediator.prototype.bidProviderExists_ = function(name){
  return !!this.bidProviders[name];
};

/**
 * The maximum time the bid provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setBidProviderCbTimeout = function(millis){
  this.bidMediator.setBidProviderCbTimeout(millis);
};

/**
 * Add a [AuctionProvider]{@link pubfood#provider.AuctionProvider} configuration object.
 * @param {AuctionDelegate} delegateConfig - configuration for a [AuctionProvider]{@link pubfood#provider.AuctionProvider}
 * @returns {null|pubfood#provider.AuctionProvider}
 */
AuctionMediator.prototype.setAuctionProvider = function(delegateConfig) {
  if (this.auctionProvider) {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: auction provider exists: ' + this.auctionProvider.name);
  }
  var auctionProvider = AuctionProvider.withDelegate(delegateConfig);
  if(auctionProvider){
    this.auctionProvider = auctionProvider;
    this.auctionProvider.setMediator(this);
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid auction provider: ' + delegateConfig.name);
  }
  return auctionProvider;
};

/**
 * Adds a function to transform provider bid request parameters, before auction provider request
 *
 * @param {TransformDelegate} delegate the transformation delegate function
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addRequestTransform = function(delegate){
  this.requestAssembler.addOperator(new TransformOperator(delegate));
  return this;
};

/**
 * Adds a function to transform provider bid results.
 *
 * @param {TransformDelegate} delegate the transformation delegate function
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.addBidTransform = function(delegate){
  this.bidAssembler.addOperator(new TransformOperator(delegate));
  return this;
};

/**
 * Load bid provider JavaScript library/tag.
 * @params {boolean} randomizeBidRequests
 */
AuctionMediator.prototype.loadProviders = function(randomizeBidRequests) {
  var uri;
  var keys = [];

  for (var bp in this.bidProviders) {
    keys.push(bp);
  }

  if (randomizeBidRequests) {
    util.randomize(keys);
  }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (this.bidProviders[key].libUri) {
      uri = this.bidProviders[key].libUri() || '';
      var sync = this.bidProviders[key].sync();
      util.loadUri(uri, sync);
    }
  }

  if (this.auctionProvider && this.auctionProvider.libUri()) {
    Event.publish(Event.EVENT_TYPE.AUCTION_LIB_LOADED, this.auctionProvider.name);

    uri = this.auctionProvider.libUri();
    // @todo get sync going here
    util.loadUri(uri);
  }
};

/**
 * Construct a set of slots for bidders.
 *
 * @returns {BidderSlots[]} bidderSlots an object containing an array of slots for each bidder.
 *
 */
AuctionMediator.prototype.getBidderSlots = function() {
  var bidderSlots = {};
  var ret = [];
  var i, k;

  for (i = 0; i < this.slots.length; i++) {
    var slot = this.slots[i];
    for (k = 0; k < slot.bidProviders.length; k++) {
      var provider = slot.bidProviders[k];

      var bSlots = bidderSlots[provider] = bidderSlots[provider] || [];
      bSlots.push(slot);
    }
  }

  for (k in bidderSlots) {
    if (this.bidProviders[k]) {
      ret.push({provider: this.bidProviders[k] || {}, slots: bidderSlots[k]});
      this.bidStatus[k] = false;
    }
  }
  return ret;
};

/**
 * Start auction bidding.
 * @param {boolean} randomizeBidRequests
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.start = function(randomizeBidRequests) {
  this.init();
  Event.publish(Event.EVENT_TYPE.AUCTION_TRIGGER, this.auctionProvider.name);

  this.loadProviders(randomizeBidRequests);

  var bidderSlots = this.getBidderSlots();

  this.bidMediator.processBids(bidderSlots);
  return this;
};

/**
 * Refresh bids for listed slot names.
 *
 * @param {string[]} slotNames slots to refresh
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.refresh = function(slotNames) {
  if(!util.isArray(slotNames)){
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid data structure, "refresh" accepts an array of strings (slot names)');
  } else {
    var i, slot;
    var self = this;

    // reset the slots
    this.slots = [];

    for (i=0; i< slotNames.length; i++) {
      slot = slotNames[i];
      if(!this.slotMap[slot]){
        Event.publish(Event.EVENT_TYPE.WARN, 'Can\'t refresh slot "'+ slot +'", because it wasn\'t defined');
      } else {
        this.slots.push(this.slotMap[slot]);
      }
    }

    if(this.slots.length > 0) {
      var name = this.auctionProvider.name;
      Event.publish(Event.EVENT_TYPE.AUCTION_REFRESH, name);

      this.bids_ = [];
      this.lateBids_ = [];

      // trigger bid provider refresh
      var bidderSlots = this.getBidderSlots();
      this.bidMediator.processBids(bidderSlots);

      // trigger auction provider refresh
      var doneCalled = false;
      var doneCb = function() {
        if (!doneCalled) {
          doneCalled = true;
          self.auctionDone(name);
        }
      };

      setTimeout(function(){
        if (!doneCalled) {
          Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The auction done callback for "'+name+'" hasn\'t been called within the allotted time (' + (self.initDoneTimeout_/1000) + 'sec)');
          doneCb();
        }
      }, this.initDoneTimeout_);

      var targeting = this.buildTargeting_();
      this.auctionProvider.refresh(targeting, doneCb);
    }
  }
  return this;
};

module.exports = AuctionMediator;

},{"../assembler/bidassembler":2,"../assembler/requestassembler":3,"../assembler/transformoperator":4,"../event":6,"../model/slot":14,"../provider/auctionprovider":15,"../provider/bidprovider":16,"../util":18,"./bidmediator":11}],11:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var Event = require('../event');
var Bid = require('../model/bid');

/**
 * BidMediator mediates provider bid requests.
 *
 * @class
 * @param {AuctionMediator} auctionMediator - auction mediator object
 * @memberof pubfood/mediator
 * @private
 */
function BidMediator(auctionMediator) {
  this.auctionMediator = auctionMediator;
  this.operators = [];
  this.callbackTimeout_ = 2000;
  this.processCounter_ = 0;
}

/**
 * Process tht bidders bids
 *
 * @param {BidderSlots[]} bidderSlots object containing slots per bidder
 */
BidMediator.prototype.processBids = function(bidderSlots) {
  this.processCounter_++;
  for (var k in bidderSlots) {
    this.getBids_(bidderSlots[k].provider, bidderSlots[k].slots);
  }
};

/**
 * The maximum time the bid provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
BidMediator.prototype.setBidProviderCbTimeout = function(millis){
  this.callbackTimeout_ = typeof millis === 'number' ? millis : 2000;
};

/**
 * @param {object} provider
 * @param {object} slots
 * @private
 */
BidMediator.prototype.getBids_ = function(provider, slots) {
  var self = this;
  var name = provider.name;
  var doneCalled = false;

  var pushBidCb = function(bid){
    self.pushBid(bid, name);
  };

  var bidDoneCb = function(){
    if(!doneCalled) {
      doneCalled = true;
      self.doneBid(name);
    }
  };

  setTimeout(function(){
    if(!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The bid done callback for "'+name+'" hasn\'t been called within the allotted time (2sec)');
      bidDoneCb();
    }
  }, this.callbackTimeout_);

  Event.publish(Event.EVENT_TYPE.BID_START, name);
  if(this.processCounter_ === 1){
    provider.init(slots, pushBidCb, bidDoneCb);
  } else {
    provider.refresh(slots, pushBidCb, bidDoneCb);
  }
};

/**
 * Raises an event to notify listeners of a [Bid]{@link pubfood#model.Bid} available.
 *
 * @param {Bid} bid The bid id
 * @param {string} providerName the name of the [BidProvider]{@link pubfood#provider.BidProvider}
 * @fires PubfoodEvent.BID_PUSH_NEXT
 */
BidMediator.prototype.pushBid = function(bid, providerName) {
  var b = Bid.fromObject(bid);
  if (b) {
    b.provider = providerName;
    Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, b);
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid bid object: ' + JSON.stringify(bid || {}));
  }
};

/**
 * Notification that the [BidProvider]{@link pubfood#provider.BidProvider} bidding is complete.
 *
 * @param {string} bidProvider The [BidProvider]{@link pubfood#provider.BidProvider} name
 * @fires PubfoodEvent.BID_COMPLETE
 */
BidMediator.prototype.doneBid = function(bidProvider) {
  // TODO consider having useful bid data available upon completion like the bids
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider);
};

module.exports = BidMediator;

},{"../event":6,"../model/bid":13}],12:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');

/**
 * BaseModelObject is a base type for [Model]{@link pubfood#model} types.
 *
 * @class
 * @memberof pubfood#model
 * @ignore
 */
function BaseModelObject() {
  this.id = util.newId();
}

module.exports = BaseModelObject;

},{"../util":18}],13:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');
var BidObject = require('../interfaces').BidObject;

/**
 * Bid is the result of a partner [BidProvider]{@link pubfood/provider.BidProvider} request.
 *
 * @class
 * @param {string} slot the slot name
 * @param {string|number} value the bid value. Default: empty string.
 * @param {Array.<number, number>} sizes the dimension sizes of the slot bid
 * @memberof pubfood#model
 */
function Bid(slot, value, sizes) {
  if (this.init_) {
    this.init_();
  }
  this.sizes = sizes;
  this.slot = slot;
  this.value = value;
  /** @property {string} type bid value type derived from {@link util.asType}  */
  this.type = util.asType(this.value);
  /** @property {string} [label] optional label for adserver key targeting for bid value e.g. <label>=2.00 */
  this.label;
  /** @property {string} [provider] the bid provider name */
  this.provider;
}

/**
 * Validate the bid config
 *
 * @param {BidObject} config
 * @return {boolean}
 * @private
 */
Bid.validate = function(config) {
  if (!config) return false;
  return util.validate(BidObject, config);
};

/**
 * Create a new [Bid]{@link pubfood#model.Bid} from an object.
 *
 * @param {BidObject} config bid object literal
 * @returns {pubfood#model.Bid|null} instance of [Bid]{@link pubfood#model.Bid}
 * @private
 */
Bid.fromObject = function(config) {
  if (!Bid.validate(config)) return null;
  var b = new Bid();
  for (var k in config) {
    if (util.asType(b[k]) === 'function') {
      b[k](config[k]);
    } else {
      b[k] = config[k];
    }
  }
  b.type = util.asType(b.value);
  return b;
};

/**
 * Sets the bid's value
 * @param {string|number} v
 * @return {pubfood#model.Bid}
 */
Bid.prototype.setValue = function(v) {
  this.value = v || '';
  this.type = util.asType(this.value);
  return this;
};

/**
 * Sets the bid's slot size
 *
 * @todo maybe combine with Bid.prototype.dimensions
 *
 * @param {string|number} w
 * @param {string|number} h
 * @return {pubfood#model.Bid}
 */
Bid.prototype.addSize = function(w, h) {
  var width = Math.abs(~~w);
  var height = Math.abs(~~h);

  this.sizes.push([width, height]);
  return this;
};

util.extends(Bid, BaseModelObject);
module.exports = Bid;

},{"../interfaces":7,"../util":18,"./basemodelobject":12}],14:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');
var slotConfig = require('../interfaces').SlotConfig;

/**
 * Slot contains a definition of a publisher ad unit.
 *
 * @class
 * @param {string} name the slot name
 * @param {string} elementId target DOM element id for the slot
 * @memberof pubfood#model
 */
function Slot(name, elementId) {
  if (this.init_) {
    this.init_();
  }
  this.name = name;
  this.elementId = elementId;
  this.bidProviders = [];
  this.sizes = [];
}

/**
 * Validate a slot configuration object.
 *
 * @param {SlotConfig} config slot configuration object
 * @return {boolean}
 * @private
 */
Slot.validate = function(config) {
  if (!config) return false;
  return util.validate(slotConfig, config);
};

/**
 * Create a new [Slot]{@link pubfood#model.Slot} from an object.
 *
 * @param {SlotConfig} config slot object literal
 * @returns {Slot|null} instance of [Slot]{@link pubfood#model.Slot}. <strong><em>null</em></strong> if invalid.
 * @private
 */
Slot.fromObject = function(config) {
  if (!Slot.validate(config)) return null;
  var s = new Slot();

  for (var k in config) {
    s[k] = config[k];
  }
  return s;
};

/**
 * Sets the slot's size/s
 *
 * @param {array.<number, number>} slotSizes
 * @param {number} slotSizes.0 width
 * @param {number} slotSizes.1 height
 * @returns {pubfood#model.Slot}
 *
 * @example
 * slot.sizes([ [300, 250], [300, 600] ]);
 * @private
 */
Slot.prototype.addSizes = function(slotSizes) {
  Array.prototype.push.apply(this.sizes, slotSizes);
  return this;
};

/**
 * Add a size dimension.
 *
 * @param {string|integer} width the width dimension
 * @param {string|integer} height the height dimension
 * @returns {pubfood#model.Slot}
 */
Slot.prototype.addSize = function(width, height) {
  var w = Math.abs(~~width);
  var h  = Math.abs(~~height);

  this.sizes.push([w, h]);
  return this;
};

/**
 * Add bid provider allocated to the slot.
 *
 * @param {string} bidProvider the provider name
 * @returns {pubfood#model.Slot}
 */
Slot.prototype.addBidProvider = function(bidProvider) {
  this.bidProviders.push(bidProvider);
  return this;
};

util.extends(Slot, BaseModelObject);
module.exports = Slot;

},{"../interfaces":7,"../util":18,"./basemodelobject":12}],15:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var AuctionDelegate = require('../interfaces').AuctionDelegate;
var Event = require('../event');

/**
 * AuctionProvider decorates the {@link AuctionDelegate} to implement the publisher ad server requests.
 *
 * @class
 * @property {string} name the name of the provider
 * @memberof pubfood#provider
 * @param {AuctionDelegate} auctionDelegate the delegate object that implements [libUri()]{@link pubfood#provider.AuctionProvider#libUri}, [init()]{@link pubfood#provider.AuctionProvider#init} and [refresh()]{@link pubfood#provider.AuctionProvider#refresh}
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
 * @private
 */
AuctionProvider.prototype.setMediator = function(mediator) {
  this.mediator = mediator;
};

/**
 * Create a new [AuctionProvider]{@link pubfood#provider.AuctionProvider} from an object.
 *
 * @param {AuctionDelegate} delegate - provider object literal
 * @returns {pubfood#provider.AuctionProvider|null} instance of [AuctionProvider]{@link pubfood#provider.AuctionProvider}. <em>null</em> if delegate is invalid.
 * @private
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
 * Checks that the delegate has the required properties specified by {@link AuctionDelegate}
 *
 * @param {AuctionDelegate} delegate - bid provider delegate object literal
 * @returns {boolean} true if delegate has required functions and properties
 * @private
 */
AuctionProvider.validate = function(delegate) {
  return util.validate(AuctionDelegate, delegate);
};

/**
 * Get the auction provider JavaScript library Uri/Url.
 *
 * @return {string}
 */
AuctionProvider.prototype.libUri = function() {
  return this.auctionDelegate.libUri;
};

/**
 * Initialize a auction provider.
 *
 * The AuctionProvider delegate Javascript and other tag setup is done here.
 *
 * @param {array.<SlotTargetingObject>} targeting - objects with bid targeting
 * @param {auctionDoneCallback} done - a callback to execute on init complete
 */
AuctionProvider.prototype.init = function(targeting, done) {
  this.auctionDelegate.init(targeting, done);
};

/**
 * Refresh for ad slots
 *
 * @param {array.<SlotTargetingObject>} targeting - objects with bid level targeting
 * @param {auctionDoneCallback} done a callback to execute on init complete
 */
AuctionProvider.prototype.refresh = function(targeting, done) {
  var refresh = (this.auctionDelegate && this.auctionDelegate.refresh) || null;
  if (!refresh) {
    Event.publish(Event.EVENT_TYPE.WARN, 'AuctionProvider.auctionDelegate.refresh not defined.');
    return;
  }
  refresh(targeting, done);
};

module.exports = AuctionProvider;

},{"../event":6,"../interfaces":7,"../util":18}],16:[function(require,module,exports){
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
 * @param {BidDelegate} delegate the delegate object that implements [libUri()]{@link pubfood#provider.BidProvider#libUri}, [init()]{@link pubfood#provider.BidProvider#init} and [refresh()]{@link pubfood#provider.BidProvider#refresh}
 * @property {string} name the name of the provider
 * @memberof pubfood#provider
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
    Event.publish(Event.EVENT_TYPE.WARN, 'BidProvider.bidDelegate.refresh not defined.');
    return;
  }
  refresh(slots, pushBid, done);
};

module.exports = BidProvider;

},{"../event":6,"../interfaces":7,"../util":18}],17:[function(require,module,exports){
/**
 * pubfood
 *
 * Pubfood - A browser client header bidding JavaScript library.
 */

'use strict';

var Event = require('./event');
var util = require('./util');
var logger = require('./logger');
var defaultBidProvider = require('./interfaces').BidDelegate;

(function(global, undefined, ctor) {

  if (global) {
    module.exports = ctor(global, global.pfConfig || {});
  }

}(window || {}, undefined, function(global/*, config*/) {

  if(global.pubfood){
    global.pubfood.library.logger.logEvent(Event.EVENT_TYPE.WARN, ['multiple api load']);
    return global.pubfood;
  }

  var pubfood = function(config) {
    return new pubfood.library.init(config);
  };

  var configErrors = [];

  var requiredApiCalls = {
    //observe: 0,
    addSlot: 0,
    setAuctionProvider: 0,
    addBidProvider: 0,
  };

  pubfood.library = pubfood.prototype = {
    version: '0.1.11',
    mediator: require('./mediator').mediatorBuilder(),
    PubfoodError: require('./errors'),
    logger: logger
  };

  /**
   * validate the api configurations
   * @private
   * @return {{hasError: boolean, details: string[]}}
   */
  var validateConfig = function() {
    var bidProviders = api.prototype.getBidProviders();

    // check for core api method calls
    for (var apiMethod in requiredApiCalls) {
      if (requiredApiCalls[apiMethod] === 0) {
        configErrors.push('"' + apiMethod + '" was not called');
      }
    }

    // validate through all the slots bid provider
    var slots = api.prototype.getSlots();
    for (var i = 0; i < slots.length; i++) {
      for (var k = 0; k < slots[i].bidProviders.length; k++) {
        var providerName = slots[i].bidProviders[k];
        // make sure there's config for each bid provider
        if (!bidProviders[providerName]) {
          configErrors.push('No configuration found for bid provider "' + providerName + '"');
        }
      }
    }

    return {
      hasError: configErrors.length > 0,
      details: configErrors
    };
  };

  /**
   * Creates a new Pubfood Bidding instance
   *
   * @alias pubfood
   * @constructor
   * @return {pubfood}
   */
  var api = pubfood.library.init = function(config) {
    Event.publish(Event.EVENT_TYPE.PUBFOOD_API_LOAD);

    logger.logCall('api.init', arguments);
    this.EVENT_TYPE = Event.EVENT_TYPE;
    this.logger = logger;
    if (config) {
      this.id_ = config.id || '';
      this.auctionProviderTimeout_ = config.auctionProviderCbTimeout || 2000;
      this.bidProviderTimeout_ = config.bidProviderCbTimeout || 2000;
      this.randomizeBidRequests_ = !!config.randomizeBidRequests;
    }
    return this;
  };

  /**
   *
   * @param {string} type
   */
  api.prototype.dumpLog = function(type){
    this.logger.dumpLog(type);
  };

  /**
   * Make this adslot avaialble for bidding
   *
   * @function
   * @param {SlotConfig} slot Slot configuration
   * @return {pubfood}
   */
  api.prototype.addSlot = function(slot) {

    if (!util.isArray(slot.bidProviders) || slot.bidProviders.length === 0) {
      slot.bidProviders = ['__default__'];
      if(!this.library.mediator.bidProviderExists_('__default__')){
        this.library.mediator.addBidProvider(defaultBidProvider);
      }
    }

    logger.logCall('api.addSlot', arguments);
    this.library.mediator.addSlot(slot);
    requiredApiCalls.addSlot++;
    return this;
  };

  /**
   * Get a list a of all registered slots
   * @return {Slot[]}
   */
  api.prototype.getSlots = function() {
    logger.logCall('api.getSlots', arguments);
    return this.library.mediator.slots;
  };

  /**
   * Set the Auction Provider
   *
   * @function
   * @param {AuctionDelegate} delegate Auction provider configuration
   * @return {pubfood}
   */
  api.prototype.setAuctionProvider = function(delegate) {
    logger.logCall('api.setAuctionProvider', arguments);
    var provider = this.library.mediator.setAuctionProvider(delegate);
    this.library.mediator.setAuctionProviderCbTimeout(this.auctionProviderTimeout_);
    requiredApiCalls.setAuctionProvider++;
    if (!provider) {
      configErrors.push('Invalid auction provider config');
    }
    return this;
  };

  /**
   * Get the Auction Provider
   * @return {pubfood#provider.AuctionProvider}
   */
  api.prototype.getAuctionProvider = function() {
    logger.logCall('api.getAuctionProvider', arguments);
    return this.library.mediator.auctionProvider;
  };

  /**
   * Add a BidProvider
   *
   * @function
   * @param {BidDelegate} delegate Bid provider configuaration
   * @example {file} ../examples/add-bid-provider.js
   * @return {pubfood}
   */
  api.prototype.addBidProvider = function(delegate) {
    logger.logCall('api.addBidProvider', arguments);
    var provider = this.library.mediator.addBidProvider(delegate);
    this.library.mediator.setBidProviderCbTimeout(this.bidProviderTimeout_);
    requiredApiCalls.addBidProvider++;
    if (!provider) {
      configErrors.push('Invalid bid provider config for ' + delegate.name);
    }
    if(typeof delegate.init === 'function' && delegate.init.length !== 3){
      configErrors.push('Bid provider '+ delegate.name +'\'s init method requires 3 arguments');
    }
    if(typeof delegate.refresh === 'function' && delegate.refresh.length !== 3) {
      configErrors.push('Bid provider ' + delegate.name + '\'s refresh method requires 3 arguments');
    }
    return this;
  };

  /**
   * Gets a list of bidproviders
   * @return {object.<BidProvider>}}
   */
  api.prototype.getBidProviders = function() {
    logger.logCall('api.getBidProvider', arguments);
    return this.library.mediator.bidProviders;
  };

  /**
   * Add a custom reporter
   * @param {string} [eventType] the event to bind this reporter to
   * @param {reporter} reporter Custom reporter
   * @return {pubfood}
   * @example {file} ../examples/reporter.js
   */
  api.prototype.observe = function(eventType, reporter) {
    logger.logCall('api.observe', arguments);
    if (typeof eventType === 'function') {
      // subscribe the reported to all the available events
      for (var e in Event.EVENT_TYPE) {
        Event.on(Event.EVENT_TYPE[e], util.bind(eventType, this));
      }
    } else if (typeof eventType === 'string') {
      if (Event.EVENT_TYPE[eventType]) {
        Event.on(Event.EVENT_TYPE[eventType], util.bind(reporter, this));
      } else {
        Event.publish(Event.EVENT_TYPE.WARN, 'Warning: Invalid event type "' + eventType + '"');
      }
    }

    return this;
  };

  /**
   * Sets the time in which bid providers must supply bids.
   *
   * @param {number} millis - milliseconds to set the timeout
   */
  api.prototype.timeout = function(millis) {
    logger.logCall('api.timeout', arguments);
    this.library.mediator.timeout(millis);
    return this;
  };

  /**
   * Sets a function delegate to initiate the publisher ad server request.
   *
   * @param {AuctionTriggerFn} delegate the function that makes the callback to start the auction
   */
  api.prototype.setAuctionTrigger = function(delegate) {
    logger.logCall('api.setAuctionTrigger', arguments);
    this.library.mediator.setAuctionTrigger(delegate);
    return this;
  };

  /**
   * Add bid transformation operator.
   *
   * @param {TransformDelegate} delegate - the delegate function
   * @return {pubfood}
   */
  api.prototype.addBidTransform = function(delegate) {
    logger.logCall('api.addBidTransform', arguments);
    this.library.mediator.addBidTransform(delegate);
    return this;
  };

  /**
   * Add request transformation operator.
   *
   * @param {TransformDelegate} delegate - the delegate function
   * @return {pubfood}
   */
  api.prototype.addRequestTransform = function(delegate) {
    logger.logCall('api.addRequestTransform', arguments);
    this.library.mediator.addRequestTransform(delegate);
    return this;
  };

  /**
   * Start the bidding process
   * @param {number} [startTimestamp] An optional timestamp that's used for calculating other time deltas.
   * @param {apiStartCallback} [startCb]
   * @return {pubfood}
   */
  api.prototype.start = function(startTimestamp, startCb) {
    Event.publish(Event.EVENT_TYPE.PUBFOOD_API_START, startTimestamp);
    logger.logCall('api.start', arguments);

    var configStatus = validateConfig();

    if(typeof startCb === 'function'){
      startCb(configStatus.hasError, configStatus.details);
    }

    // only continue of there aren't any config errors
    if (!configStatus.hasError) {
      this.library.mediator.start(this.randomizeBidRequests_);
    }

    return this;
  };

  /**
   * Refresh slot bids.
   *
   * @param {string[]} [slotNames] Optional list of slot names to refresh.
   * @return {pubfood}
   */
  api.prototype.refresh = function(slotNames) {
    logger.auction++;
    logger.logCall('api.refresh', arguments);
    this.library.mediator.refresh(slotNames);
    return this;
  };

  api.prototype.library = pubfood.library;

  global.pubfood = pubfood;
  return pubfood;
}));

},{"./errors":5,"./event":6,"./interfaces":7,"./logger":8,"./mediator":9,"./util":18}],18:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';
/**
 * @namespace util
 * @private
 */
var util = {
  /**
   * Get the type name of an object.
   *
   * @see https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
   *
   * @function asType
   * @returns {string}
   * @memberof util
   */
  asType: function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  },
  newId: function() {
    /*jslint bitwise: true */
    return (+new Date()).toString(36) + 'xxxxxxxxxx'
      .replace(/[x]/g, function() {
        return (0 | Math.random() * 36).toString(36);
      });
    /*jslint bitwise: false */
  },
  /*
   * Simple class extension/inheritance
   *
   * @todo refactor to use? - https://github.com/isaacs/inherits
   */
  extends: function(child, parent) {

    for (var k in parent.prototype) {
      child.prototype[k] = parent.prototype[k];
    }

    child.prototype.parents = child.prototype.parents || [];
    child.prototype.parents.push(function() {
      return parent;
    });

    child.prototype.init_ = function() {
      var parents = this.parents || [];

      for (var i in parents) {
        parents[i]().call(this);
      }
    };
  },
  hasFunctions: function(object, fnNames) {
    if (!object)  return false;

    var ret = true;
    for (var i = 0; i < fnNames.length; i++) {
      var name = fnNames[i];
      if (!object[name] || !util.asType(object[name]) === 'function') {
        ret = false;
        break;
      }
    }
    return ret;
  },
  loadUri: function(uri, sync) {
    var doc = document;
    var scriptSrc = uri || '';
    if (sync) {
      if (doc.readyState === 'complete' || doc.readyState === 'loaded') {
        // TODO consider warning of an unsafe attempt to document.write too late
      } else {
        /*eslint-disable no-empty */
        try {
          doc.write('<script src="' + scriptSrc + '"></script>');
        } catch (e) { }
        /*eslint-enable no-empty: */
      }
    } else {
      var scriptEl = document.createElement('script');
      scriptEl.async = true;
      scriptEl.src = scriptSrc;
      (doc.head || doc.body || doc.documentElement).appendChild(scriptEl);
    }
  },
  bind: function(fn, ctx) {
    return function() {
      fn.apply(ctx, Array.prototype.slice.call(arguments));
    };
  },
  mergeToObject: function(o1, o2) {
    for (var p in o2) {
      if (o2.hasOwnProperty(p)) {
        if (this.isObject(o2[p])) {
          if (!o1[p]) {
            o1[p] = {};
          }
          this.mergeToObject(o1[p], o2[p]);
        } else if (this.isArray(o2[p])) {
          if (!o1[p]) {
            o1[p] = [];
          }
          this.mergeToArray(o1[p], o2[p]);
        } else {
          o1[p] = o2[p];
        }
      }
    }
    return o1;
  },
  mergeToArray: function(a1, a2) {
    for (var i = 0; i < a2.length; i++) {
      a1.push(this.clone(a2[i]));
    }
    return a1;
  },
  isArray: function(o) {
    return !!o && this.asType(o) === 'array';
  },
  isObject: function(o) {
    return !!o && this.asType(o) === 'object';
  },
  clone: function(v) {
    return this.isObject(v) ? this.cloneObject(v) : this.isArray(v) ? this.cloneArray(v) : v;
  },
  cloneArray: function(a) {
    return this.mergeToArray([], a);
  },
  cloneObject: function(o) {
    return this.mergeToObject({}, o);
  },
  values: function(obj) {
    var arr = [];
    for (var k in obj) {
      arr.push(obj[k]);
    }
    return arr;
  },
  validate: function(type, obj) {
    if (!obj) return false;
    var err = 0;
    for (var k in type) {
      if (k === 'optional') continue;

      var isOpt = !!type.optional &&!!type.optional[k],
        hasProp = obj.hasOwnProperty(k),
        valType = this.asType(obj[k]),
        isModel = !obj['init'],
        isSet = true;

      if (valType === 'null' || valType === 'undefined'
          || (valType === 'number' && !isFinite(obj[k]))
          || (valType === 'string' && obj[k] === '')
         ) isSet = false;

      if (!isOpt && (!hasProp || !isSet)) ++err;

      if (isSet && isModel &&
        (util.isArray(obj[k]) && obj[k].length === 0)) ++err;

      if (isSet && !isModel && // model object Bid+Slot can have mixed types
        (util.asType(obj[k]) !== util.asType(type[k]))) ++err;

      if (err > 0) break;
    }
    return !err;
  }
};

/**
 * Randomize the position of items in an array. The original array will be
 * both changed in place and returned. The algorithm implemented here is a
 * Fisher–Yates Shuffle which is unbiased.
 *
 * @see http://bost.ocks.org/mike/shuffle/
 *
 * @param {array} array that should be permuted in place and returned.
 * @return {array} the permuted array.
 */
util.randomize = function(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
};

module.exports = util;

},{}]},{},[17])(17)
});