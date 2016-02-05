/*! pubfood v0.2.0 | (c) pubfood | http://pubfood.org/LICENSE.txt */
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

},{"../errors":5,"../event":6,"../util":16}],5:[function(require,module,exports){
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
 * @return {PubfoodEvent}
 * @extends EventEmitter
 * @see https://github.com/primus/eventemitter3
 */
function PubfoodEvent() {
  this.auctionId = 'pubfood:' + Date.now();
  /**
   * Map of emitted events without registered handlers.
   *
   * @private
   */
  this.observeImmediate_ = {};
  // PubfoodEvent constructor
}

/**
 * Set the pubfood auctionId
 * @param {string|number} auctionId the auction identifier
 * @private
*/
PubfoodEvent.prototype.setAuctionId = function(auctionId) {
  var type = util.asType(auctionId);
  if (type === 'string' || type === 'number') {
    this.auctionId = auctionId;
  }
  return this.auctionId;
};

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
   * Api library refresh
   * @event PubfoodEvent.PUBFOOD_API_REFRESH
   * @property {number} data api refresh timestamp
   * @private
   */
  PUBFOOD_API_REFRESH: 'PUBFOOD_API_REFRESH',
  /**
   * Bid provider library load started
   * @event PubfoodEvent.BID_LIB_START
   * @private
   */
  BID_LIB_START: 'BID_LIB_START',
  BID_LIB_LOAD: 'BID_LIB_LOAD',
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
   *  Next item in data stream was late meeting the auction timeout.
   *
   * @event PubfoodEvent.BID_PUSH_NEXT_LATE
   * @property {object} data @see [Bid]{@link pubfood#model.Bid}
   * @property {string} data.id
   * @property {array.<number, number>} data.sizes
   * @property {string} data.value
   * @property {object} data.targeting
   * @private
   */
  BID_PUSH_NEXT_LATE: 'BID_PUSH_NEXT_LATE',
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
  AUCTION_LIB_LOAD: 'AUCTION_LIB_LOAD',
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
  AUCTION_START: 'AUCTION_START',
  /**
   * Start the publisher auction from a business rule.
   * e.g. a bidder timeout
   * @event PubfoodEvent.AUCTION_TRIGGER
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   * @private
   */
  AUCTION_TRIGGER: 'AUCTION_TRIGGER',
  /**
   * The auction was refreshed
   * @event PubfoodEvent.AUCTION_REFRESH
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
   */
  AUCTION_REFRESH: 'AUCTION_REFRESH',
  /**
   * The auction has finished running
   * @event PubfoodEvent.AUCTION_COMPLETE
   * @property {object} data
   * @property {string} data.name the [AuctionProvider.name]{@link pubfood#provider.AuctionProvider} property value
   * @property {array.<TargetingObject>} data.targeting targeting data used in the auction
   */
  AUCTION_COMPLETE: 'AUCTION_COMPLETE',
  /**
   * Functions dependent on the completed auction can be called
   * @event PubfoodEvent.AUCTION_POST_RUN
   * @property {string} data [AuctionProvider.name]{@link pubfood#provider.AuctionProvider}
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

  var event = {
    auctionId: this.auctionId,
    ts: ts,
    type: eventType,
    eventContext: eventContext || 'pubfood',
    data: data || ''
  };
  logger.logEvent(eventType, this.auctionId, event);

  return this.emit(eventType, event);
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

},{"./logger":8,"./util":16,"eventemitter3":1}],7:[function(require,module,exports){
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
 * @property {array.<TargetingObject>} init.targeting
 * @property {auctionDoneCallback} init.done Callback to execute on done
 * @property {function} [refresh] Auction provider delegate refresh auction request.<br>Called at startup.
 * @property {array.<TargetingObject>} refresh.targeting
 * @property {auctionDoneCallback} refresh.done Callback to execute on done
 * @property {function} [trigger] Auction provider delegate function to trigger the auction. Default: [pubfood.timeout]{@link pubfood#timeout}
 * @property {auctionDoneCallback} trigger.done Callback to initialize the auction provider
 * @memberof typeDefs
 */
var auctionDelegate = {
  name: '',
  libUri: '',
  timeout: 0,
  init: function(targeting, done) {},
  refresh: function(targeting, done) {}
};
auctionDelegate.optional = {
  refresh: true,
  timeout: true
};

/**
 * Interface for classes that are delegates for the BidProvider decorator.
 *
 * @typedef {BidDelegate} BidDelegate
 * @property {string} name Bid provider delegate name.
 * @property {string} [libUri] location of the delegate JavaScript library/tag.
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
  timeout: 0,
  init: function(slots, pushBid, done) {
    done();
  },
  refresh: function(slots, pushBid, done) {
    done();
  }
};
bidDelegate.optional = {
  libUri: true,
  refresh: true,
  timeout: true
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
 * @property {string} [slot] - slot name
 * @property {string} [value] - publisher adserver targeting bid value. Default: empty string.
 * @property {array.array.<number, number>} [sizes] - array of sizes for the slot the bid is for
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
 * @typedef {TargetingObject} TargetingObject
 *
 * Key value targeting for a specific slot or the page.
 * @property {string} [type] the targeting level [slot|page]
 * @deprecated Property, <code>TargetingObject.type [slot|page]</code>.<br> Use the existence of "<em><code>TargetingObject.name</code></em>" to detect targeting is slot-level
 * @property {string} [name] the [Slot.name]{@link pubfood#model.Slot#name}
 * @property {string} [id] if targeting object is for a slot, the generated identifier of the slot
 * @property {string} [elementId] the target DOM element id
 * @property {array.<number, number>} [sizes] array of slot sizes
 * @property {object.<string, string>} targeting object containing key/value pair targeting
 * @property {array.<object>} bids source bids for the targeting object
 * @memberof typeDefs
 */

/**
 *
 * @typedef {PubfoodConfig} PubfoodConfig [pubfood]{@link pubfood} constructor configuration
 * @property {number} [auctionProviderCbTimeout] The maximum time the auction provider has before calling [done()]{@link typeDefs.auctionDoneCallback} inside the [AuctionProvider.init]{@link pubfood#provider.AuctionProvider#init} or [AuctionProvider.refresh]{@link pubfood#provider.AuctionProvider#refresh} methods
 * @property {number} [bidProviderCbTimeout] The maximum time the bid provider has before calling [done()]{@link typeDefs.bidDoneCallback} inside the [BidProvider.init]{@link pubfood#provider.BidProvider#init} or [BidProvider.refresh]{@link pubfood#provider.BidProvider#refresh} methods
 * @property {boolean} [randomizeBidRequests] Randomize the order in which [BidProvider]{@link pubfood#provider.BidProvider} requests are made. Default: false.
 * @memberof typeDefs
 * @deprecated the PubfoodConfig configuration object will be replaced in a future major release. [pubfood]{@link pubfood} methods for configuraion properties will be available.
 */
var PubfoodConfig = {
  auctionProviderCbTimeout: 2000,
  bidProviderCbTimeout: 2000,
  randomizeBidRequests: false
};

/**
 * @typedef {AuctionRun} AuctionRun - data pertaining to an init or refresh auction execution
 * @property {boolean} inAuction false if bidding still in process
 * @property {array.<Slot>} slots the slots to be filled for the auction
 * @property {array.<Bid>} bids the bids for the auction run
 * @property {array.<Bid>} lateBids bids that did not get pushed before the timeout to participate in the auction
 * @property {object.<string, boolean>} bidStatus flag to indicate if a bid provider is completed bidding
 * @property {array.<TargetingObject>} targeting the targeting objects used in the auction run 
 * @memberof typeDefs
 * @private
 */

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
  history: [],
  dumpLog: function(type) {
    if (console && console.log) {
      var re;
      if (type) {
        re = new RegExp(type, 'g');
      }
      for (var i = 0; i < this.history.length; i++) {
        var log = this.history[i];
        if(re){
          re.lastIndex = 0;
          if(log.eventName && re.test(log.eventName)) {
            console.log(log);
          }
          if(log.functionName && re.test(log.functionName)) {
            console.log(log);
          }
        } else {
          console.log(log);
        }
      }
    }
  },
  logCall: function(name, auctionId, args) {
    this.history.push({
      ts: (+new Date()),
      auctionId: auctionId,
      functionName: name,
      args: Array.prototype.slice.call(args)
    });
  },
  logEvent: function(name, auctionId, event){
    this.history.push({
      ts: (+new Date()),
      auctionId: auctionId,
      eventName: name,
      event: event
    });
  }
};

module.exports = logger;

},{}],9:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var Slot = require('../model/slot');
var Bid = require('../model/bid');
var BidAssembler = require('../assembler/bidassembler');
var RequestAssembler = require('../assembler/requestassembler');
var TransformOperator = require('../assembler/transformoperator');
var AuctionProvider = require('../provider/auctionprovider');
var BidProvider = require('../provider/bidprovider');
var Event = require('../event');
var PubfoodObject = require('../pubfoodobject');

/**
 * AuctionMediator coordiates requests to Publisher Ad Servers.
 *
 * @class
 * @memberof pubfood#mediator
 * @private
 */
function AuctionMediator(config) {
  if (this.init_) {
    this.init_();
  }

  /** @property {boolean} prefix if false, do not add bid provider name to bid targeting key. Default: true */
  this.prefix = config && config.hasOwnProperty('prefix') ? config.prefix : true;
  // store slots by name for easy lookup
  this.slotMap = {};
  this.bidProviders = {};
  this.auctionProvider = null;
  this.auctionRun = {};
  this.timeout_ = AuctionMediator.NO_TIMEOUT;
  this.trigger_ = null;
  this.bidAssembler = new BidAssembler();
  this.requestAssembler = new RequestAssembler();
  this.auctionIdx_ = 0;
  this.doneCallbackOffset_ = AuctionMediator.DEFAULT_DONE_CALLBACK_OFFSET;
  this.omitDefaultBidKey_ = false;
  Event.setAuctionId(this.getAuctionId());
}

AuctionMediator.PAGE_BIDS = 'page';
AuctionMediator.AUCTION_TYPE = { START: 'init', REFRESH: 'refresh'};
AuctionMediator.IN_AUCTION = { FALSE: false, PENDING: 'pending', DONE: 'done'};
AuctionMediator.NO_TIMEOUT = -1;
AuctionMediator.DEFAULT_DONE_CALLBACK_OFFSET = 5000;

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
      /* eslint-disable no-unused-vars */
      for (var i in this.slotMap) {
        /* eslint-enable no-unused-vars */
        return true;
      }
      return false;
    },
    hasAllSlotsBidder: function() {
      var noBidders = [];
      for (var k in this.slotMap) {
        var slot = this.slotMap[k];
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
 * Create a new [AuctionRun]{@link typeDefs.AuctionRun} data object.
 *
 * @param {array.<string>} [slotNames] the slot names to include in the auction
 * @return {number} - the auction count index
 * @private
 */
AuctionMediator.prototype.newAuctionRun = function(slotNames) {
  var idx = ++this.auctionIdx_;
  var auctionSlots = [];
  if (util.isArray(slotNames) && slotNames.length > 0) {
    for (var i = 0; i < slotNames.length; i++) {
      var slot = slotNames[i];
      if(!this.slotMap[slot]){
        Event.publish(Event.EVENT_TYPE.WARN, 'Can\'t refresh slot "'+ slot +'", because it wasn\'t defined');
      } else {
        auctionSlots.push(this.slotMap[slot]);
      }
    }
  } else {
    for (var k in this.slotMap) {
      auctionSlots.push(this.slotMap[k]);
    }
  }

  var auctionRun  = {
    inAuction: AuctionMediator.IN_AUCTION.FALSE,
    slots: auctionSlots,
    bids: [],
    lateBids: [],
    bidStatus: {},
    targeting: []
  };
  // reset bidder status
  for (var k in this.bidProviders) {
    var provider = this.bidProviders[k];
    if (provider && !(provider.name in auctionRun.bidStatus) && provider.enabled()) {
      auctionRun.bidStatus[provider.name] = false;
    }
  }
  this.auctionRun[idx] = auctionRun;
  return idx;
};

/**
 * Get the bidding status of a provider.
 * <br>
 * <ul>
 * <li>-1: if provider is not bidding in the auction</li>
 * <li>true: if bidding in the auction and complete</li>
 * <li>false: if bidding in the auction and in process</li>
 * </ul>
 * @param {string} providerName the name of the [BidProvider]{@link pubfood#provider.BidProvider}
 * @param {string} auctionIdx the index number of the init/refresh auction
 * @return {boolean|number}
 * -1 if provider is not bidding in the auction
 * @private
 */
AuctionMediator.prototype.getBidStatus = function(providerName, auctionIdx) {
  var ret = [];
  if (auctionIdx) {
    var run = this.auctionRun[auctionIdx];
    var status = run ? run.bidStatus[providerName] : '';
    ret = util.asType(status) === 'boolean' ? status : -1;
  } else {
    for (var i in this.auctionRun) {
      var status = this.auctionRun[i].bidStatus[providerName];
      ret.push(util.asType(status) === 'boolean' ? status : -1);
    }
  }
  return ret;
};

/**
 * Sets the time in which bid providers must supply bids.
 *
 * @param {number} millis - milliseconds to set the timeout
 */
AuctionMediator.prototype.timeout = function(millis) {
  this.timeout_ = util.asType(millis) === 'number' && millis > 0 ? millis : AuctionMediator.NO_TIMEOUT;
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
 * Sets the default done callback timeout offset. Default: <code>5000ms</code>
 * <p>
  * If a [BidProvider.timeout]{@link pubfood#provider.BidProvider#timeout} or [AuctionProvider.timeout]{@link pubfood#provider.AuctionProvider#timeout} do not have their timeout property value set, specifies the additional time in which a provider needs to call [done()]{@link typeDefs.bidDoneCallback} / [done()]{@link typeDefs.auctionDoneCallback} respectively is:
 *   <code>timeout(millis) + doneCallbackOffset(millis)</code><br>
 * <p>If the timeout elapses, done() is called on behalf of the provider.
 * <p>Assists capturing late bid data for analytics and reporting by giving additional timeout "grace" period.
 * @param {number} millis - milliseconds to set the timeout
 */
AuctionMediator.prototype.doneCallbackOffset = function(millis) {
  this.doneCallbackOffset_ = util.asType(millis) === 'number' ? millis : AuctionMediator.DEFAULT_DONE_CALLBACK_OFFSET;
};

/**
 * Gets the default done callback timeout offset.
 *
 * @return {number} the timeout in milliseconds
 */
AuctionMediator.prototype.getDoneCallbackOffset = function() {
  return this.doneCallbackOffset_;
};

/**
 * The maximum time the auction provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setAuctionProviderCbTimeout = function(millis){
  this.initDoneTimeout_ = util.asType(millis) === 'number' && millis > 0 ? millis : this.doneCallbackOffset_;
};

/**
 * Set a custom function that receives a callback to start the auction.
 * <p>
 * The function parameter will receive a callback argument that is used
 * to start the auction.
 * <p>
 * If you have business or other logic that determines when the
 * auction must start a trigger function can be used.
 *
 * Otherwise, use [timeout()]{@link pubfood#mediator.AuctionMediator#timeout}.
 *
 * @param {function} triggerFn custom function with startAuction callback parameter
 * @example
 var trigger = function(startAuction) {
   setTimeout(function() {
       startAuction();
   }, 1500);
 };
 pf.setAuctionTrigger(trigger);
 */
AuctionMediator.prototype.setAuctionTrigger = function(triggerFn) {
  this.trigger_ = triggerFn;
};

/**
 * Start the process to build and send publisher ad server auction request.
 * @private
 */
AuctionMediator.prototype.startAuction_ = function(auctionIdx, auctionType) {
  Event.publish(Event.EVENT_TYPE.BID_ASSEMBLER, 'AuctionMediator');
  if (this.bidAssembler.operators.length > 0) {
    this.bidAssembler.process(this.auctionRun[auctionIdx].bids);
  }
  this.processTargeting_(auctionIdx, auctionType);
};

/**
 * Start the bid provider timeout.
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.startTimeout_ = function(auctionIdx, auctionType) {
  if (this.timeout_ !== AuctionMediator.NO_TIMEOUT && this.timeout_ >= 0) {
    var idx = auctionIdx,
      type = auctionType,
      startFn = util.bind(this.startAuction_, this);;
    setTimeout(function() {
      startFn(idx, type);
    }, this.timeout_);
  }
  return this;
};

/**
 * Start auction timeout or delegate to [setAuctionTrigger()]{@link pubfood#mediator.AuctionMediator#setAuctionTrigger}.
 * @private
 * @return {AuctionMediator}
 */
AuctionMediator.prototype.initAuctionTrigger_ = function(auctionIdx, auctionType) {
  if (util.asType(this.trigger_) !== 'function') {
    this.startTimeout_(auctionIdx, auctionType);
    return;
  }

  var idx = auctionIdx,
    type = auctionType;
  function triggerAuction() {
    if (!this.auctionRun[idx].inAuction) {
      this.startAuction_(idx, type);
    }
  }

  this.trigger_.apply(null, [util.bind(triggerAuction, this)]);

  return this;
};

/**
 * Check bidder status if all are done.
 *
 * @returns {boolean} true if all bidders are complete. False otherwise.
 *
 */
AuctionMediator.prototype.allBiddersDone = function(auctionIdx) {
  var allDone = true;
  var bidStatus = this.auctionRun[auctionIdx].bidStatus;
  for (var provider in bidStatus) {
    if (!bidStatus[provider]) {
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
 * @private
 */
AuctionMediator.prototype.checkBids_ = function(auctionIdx, auctionType) {
  if (this.allBiddersDone(auctionIdx) && !this.auctionRun[auctionIdx].inAuction) {
    this.startAuction_(auctionIdx, auctionType);
  }
};

AuctionMediator.prototype.getBidKey = function(bid) {
  return (this.prefix && bid.provider ? bid.provider + '_' : '') + (bid.label || 'bid');
};

AuctionMediator.prototype.mergeKeys = function(slotTargeting, bidTargeting) {
  slotTargeting = util.mergeToObject(slotTargeting, bidTargeting);
};

/**
 * Builds a map of slot and page-level bids.
 * @private
 * @return {object.<string, Bid>} targeting objects
 */
AuctionMediator.prototype.getBidMap_ = function(auctionIdx) {
  var bidMap = {};
  bidMap[AuctionMediator.PAGE_BIDS] = [];
  var bids = this.getAuctionRunBids(auctionIdx);;
  for (var i = 0; i < bids.length; i++) {
    var bid = bids[i];
    if (bid.slot) {
      bidMap[bid.slot] = bidMap[bid.slot] || [];
      bidMap[bid.slot].push(bid);
    } else {
      bidMap[AuctionMediator.PAGE_BIDS].push(bid);
    }
  }
  return bidMap;
};

/**
 * Builds targeting objects for [AuctionDelegate]{@link typeDefs.AuctionDelegate} requests.
 *
 * Flattens all bid targeting into targeting object property. All bid specific
 * targeting is kept in the bid added to [bids]{@link typeDefs.TargetingObject}.
 *
 * First bid with [targeting]{@link typeDefs.TargetingObject}[key] wins in top level flattened object.
 *
 * @private
 * @return {object[]} targeting objects
 */
AuctionMediator.prototype.buildTargeting_ = function(auctionIdx) {
  var auctionTargeting = [];
  var bidSet;
  var bidMap = this.getBidMap_(auctionIdx);

  // Slot-level targeting
  var auctionSlots = this.getAuctionRunSlots(auctionIdx);
  for (var i = 0; i < auctionSlots.length; i++) {
    var tgtObject = {bids: [], targeting: {}};

    var slot = auctionSlots[i];
    tgtObject.name = slot.name;
    tgtObject.id = slot.id;
    tgtObject.elementId = slot.elementId || '';
    tgtObject.sizes = slot.sizes;
    tgtObject.type = 'slot';

    bidSet = bidMap[slot.name] || [];
    for (var j = 0; j < bidSet.length; j++) {
      var bid = bidSet[j];
      tgtObject.bids.push({
        value: bid.value || '',
        provider: bid.provider,
        id: bid.id,
        targeting: bid.targeting || {}
      });

      if (!this.omitDefaultBidKey()) {
        var bidKey = this.getBidKey(bid);
        tgtObject.targeting[bidKey] = tgtObject.targeting[bidKey] || (bid.value || '');
      }
      this.mergeKeys(tgtObject.targeting, bid.targeting);
    }
    auctionTargeting.push(tgtObject);
  }

  var pgTgtObject = {bids: [], targeting: {}};;
  bidSet = bidMap[AuctionMediator.PAGE_BIDS] || [];

  // Page-level targeting
  for(var k = 0; k < bidSet.length; k++) {
    var bid = bidSet[k];

    pgTgtObject.bids.push({
      value: bid.value || '',
      provider: bid.provider,
      id: bid.id,
      targeting: bid.targeting
    });

    if (!this.omitDefaultBidKey()) {
      var bidKey = this.getBidKey(bid);
      pgTgtObject.targeting[bidKey] = pgTgtObject.targeting[bidKey] || (bid.value || '');
    }
    this.mergeKeys(pgTgtObject.targeting, bid.targeting);
  }
  if (pgTgtObject.bids.length > 0) {
    pgTgtObject.type = 'page';
    auctionTargeting.push(pgTgtObject);
  }
  return auctionTargeting;
};

/**
 * process the targeting for the auction provider
 * @private
 */
AuctionMediator.prototype.processTargeting_ = function(auctionIdx, auctionType) {
  if (this.auctionRun[auctionIdx].inAuction) return;
  this.auctionRun[auctionIdx].inAuction = AuctionMediator.IN_AUCTION.PENDING;

  var self = this;
  var doneCalled = false;
  var name = self.auctionProvider.name;
  var idx = auctionIdx;
  var cbTimeout = self.auctionProvider.getTimeout();

  var timeoutId;
  var doneCb = function() {
    if (!doneCalled) {
      doneCalled = true;
      clearTimeout(timeoutId);
      self.auctionDone(idx, name);
    }
  };

  timeoutId = setTimeout(function() {
    if (!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The auction done callback for "' + name + '" hasn\'t been called within the allotted time (' + (cbTimeout / 1000) + 'sec)');
      doneCb();
    }
  }, cbTimeout);

  // publish events to include buildTargeting_ in auction timing
  if (auctionType === AuctionMediator.AUCTION_TYPE.START) {
    Event.publish(Event.EVENT_TYPE.AUCTION_GO, name);
    Event.publish(Event.EVENT_TYPE.AUCTION_START, name);
  } else {
    Event.publish(Event.EVENT_TYPE.AUCTION_REFRESH, name);
  }

  var targeting = self.buildTargeting_(idx);
  this.auctionRun[idx].targeting = targeting;

  if (auctionType === AuctionMediator.AUCTION_TYPE.START) {
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
AuctionMediator.prototype.auctionDone = function(auctionIdx, data) {
  this.auctionRun[auctionIdx].inAuction = AuctionMediator.IN_AUCTION.DONE;
  var auctionTargeting = this.getAuctionRun(auctionIdx).targeting;
  Event.publish(Event.EVENT_TYPE.AUCTION_COMPLETE, { name: data, targeting: auctionTargeting });
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
    this.slotMap[slot.name] = slot;
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid slot object: ' + JSON.stringify(slotConfig || {}));
  }
  return slot;
};

/**
 * Get the bid/auction provider done callback timeout
 * @param {BidDelegate|AuctionDelegate} delegate the provider delegate object
 * @private
 */
AuctionMediator.prototype.getProviderDoneTimeout_ = function(delegate) {
  var providerDoneTimeout = this.timeout_ + this.doneCallbackOffset_;
  if (delegate.timeout) {
    providerDoneTimeout = delegate.timeout;
  }
  return providerDoneTimeout;
};

/**
 * Get bid provider done timeout
 * @deprecated to be refactored when {@link typeDefs.PubfoodConfig} removed
 */
AuctionMediator.prototype.getBidProviderDoneTimeout_ = function(delegate) {
  var doneTimeout = this.getProviderDoneTimeout_(delegate);
  if (this.callbackTimeout_) {
    doneTimeout = this.callbackTimeout_;
  }
  return doneTimeout;
};

/**
 * Get auction provider done timeout
 * @deprecated to be refactored when {@link typeDefs.PubfoodConfig} removed
 */
AuctionMediator.prototype.getAuctionProviderDoneTimeout_ = function(delegate) {
  var doneTimeout = this.getProviderDoneTimeout_(delegate);
  if (this.initDoneTimeout_) {
    doneTimeout = this.initDoneTimeout_;
  }
  return doneTimeout;
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
      var bidDoneTimeout = this.getBidProviderDoneTimeout_(delegateConfig);
      bidProvider.timeout(bidDoneTimeout);
      this.bidProviders[bidProvider.name] = bidProvider;
    }
  } else {
    var name = delegateConfig && delegateConfig.name ? delegateConfig.name : 'undefined';
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid bid provider: ' + name);
  }
  return bidProvider;
};

AuctionMediator.prototype.bidProviderExists_ = function(name){
  return !!this.bidProviders[name];
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
  if (auctionProvider) {
    var auctionDoneTimeout = this.getAuctionProviderDoneTimeout_(delegateConfig);
    auctionProvider.timeout(auctionDoneTimeout);
    this.auctionProvider = auctionProvider;
  } else {
    var name = delegateConfig && delegateConfig.name ? delegateConfig.name : 'undefined';
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: invalid auction provider: ' + name);
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
      Event.publish(Event.EVENT_TYPE.BID_LIB_LOAD, this.bidProviders[key].name);

      uri = this.bidProviders[key].libUri() || '';
      var sync = this.bidProviders[key].sync();
      util.loadUri(uri, sync);
    }
  }

  if (this.auctionProvider && this.auctionProvider.libUri()) {
    Event.publish(Event.EVENT_TYPE.AUCTION_LIB_LOAD, this.auctionProvider.name);

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
AuctionMediator.prototype.getBidderSlots = function(slots) {
  var bidderSlots = {};
  var ret = [];
  var i, k;

  for (i = 0; i < slots.length; i++) {
    var slot = slots[i];
    for (k = 0; k < slot.bidProviders.length; k++) {
      var provider = slot.bidProviders[k];

      bidderSlots[provider] = bidderSlots[provider] || [];
      bidderSlots[provider].push(slot);;
    }
  }

  for (k in this.bidProviders) {
    var provider = this.bidProviders[k];
    if (provider && provider.enabled()) {
      ret.push({provider: provider, slots: bidderSlots[k] || []});
    }
  }
  return ret;
};

/**
 * Start auction bidding.
 * @param {boolean} randomizeBidRequests
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.start = function(randomizeBidRequests, startTimestamp) {
  if (!this.auctionProvider) {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: auction provider is not defined.');
    return this;
  }
  var auctionIdx = this.newAuctionRun();
  Event.setAuctionId(this.getAuctionId(auctionIdx));
  Event.publish(Event.EVENT_TYPE.PUBFOOD_API_START, startTimestamp);

  this.initAuctionTrigger_(auctionIdx, AuctionMediator.AUCTION_TYPE.START);

  this.loadProviders(randomizeBidRequests);
  var auctionSlots = this.getAuctionRunSlots(auctionIdx);
  var bidderSlots = this.getBidderSlots(auctionSlots);

  this.processBids(auctionIdx, AuctionMediator.AUCTION_TYPE.START, bidderSlots);
  return this;
};

/**
 * Refresh bids for listed slot names.
 *
 * @param {string[]} slotNames slots to refresh
 * @returns {pubfood#mediator.AuctionMediator}
 */
AuctionMediator.prototype.refresh = function(slotNames) {
  if (!this.auctionProvider) {
    Event.publish(Event.EVENT_TYPE.WARN, 'Warning: auction provider is not defined.');
    return this;
  }
  var auctionIdx = this.newAuctionRun(slotNames);
  Event.setAuctionId(this.getAuctionId(auctionIdx));
  Event.publish(Event.EVENT_TYPE.PUBFOOD_API_REFRESH);

  this.initAuctionTrigger_(auctionIdx, AuctionMediator.AUCTION_TYPE.REFRESH);

  var auctionSlots = this.getAuctionRunSlots(auctionIdx);
  var bidderSlots = this.getBidderSlots(auctionSlots);
  this.processBids(auctionIdx, AuctionMediator.AUCTION_TYPE.REFRESH, bidderSlots);

  return this;
};

/**
 * Process the bid provider bids
 *
 * @param {BidderSlots[]} bidderSlots object containing slots per bidder
 */
AuctionMediator.prototype.processBids = function(auctionIdx, auctionType, bidderSlots) {
  for (var k = 0; k < bidderSlots.length; k++) {
    this.getBids_(auctionIdx, auctionType, bidderSlots[k].provider, bidderSlots[k].slots);
  }
};

/**
 * The maximum time the bid provider has before calling `done` inside the `init` method
 *
 * @param {number} millis timeout in milliseconds
 */
AuctionMediator.prototype.setBidProviderCbTimeout = function(millis){
  this.callbackTimeout_ = util.asType(millis) === 'number' && millis > 0 ? millis : this.doneCallbackOffset_;
};

/**
 * @param {object} provider
 * @param {object} slots
 * @private
 */
AuctionMediator.prototype.getBids_ = function(auctionIdx, auctionType, provider, slots) {
  var self = this;
  var name = provider.name;
  var doneCalled = false;
  var idx = auctionIdx;
  var cbTimeout = provider.getTimeout();
  var pushBidCb = function(bid){
    bid.auctionIdx = idx;
    self.pushBid(idx, bid, name);
  };

  var timeoutId;
  var bidDoneCb = function(){
    if(!doneCalled) {
      doneCalled = true;
      clearTimeout(timeoutId);
      self.doneBid(idx, auctionType, name);
    }
  };

  timeoutId = setTimeout(function(){
    if(!doneCalled) {
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: The bid done callback for "'+name+'" hasn\'t been called within the allotted time (' + (cbTimeout/1000) + 'sec)');
      bidDoneCb();
    }
  }, cbTimeout);

  Event.publish(Event.EVENT_TYPE.BID_START, name);
  if (auctionType === AuctionMediator.AUCTION_TYPE.START) {
    provider.init(slots, pushBidCb, bidDoneCb);
  } else {
    provider.refresh(slots, pushBidCb, bidDoneCb);
  }
};

/**
 * Pushes a [BidObject]{@link typeDefs.BidObject} to be available for auction processing.
 *
 * @param {BidObject} bid object from which to build a [Bid]{@link pubfood#model.Bid}
 * @param {string} providerName the name of the [BidProvider]{@link pubfood#provider.BidProvider}
 * @fires pubfood.PubfoodEvent.BID_PUSH_NEXT
 */
AuctionMediator.prototype.pushBid = function(auctionIdx, bidObject, providerName) {
  var bid = Bid.fromObject(bidObject);
  if (bid) {
    bid.provider = providerName;
    if (!this.auctionRun[auctionIdx].inAuction) {
      this.auctionRun[auctionIdx].bids.push(bid);
      Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, bid);
    } else {
      this.auctionRun[auctionIdx].lateBids.push(bid);
      Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT_LATE, bid);
    }
  } else {
    Event.publish(Event.EVENT_TYPE.WARN, 'Invalid bid object: ' + JSON.stringify(bidObject || {}));
  }
};

/**
 * Notification that the [BidProvider]{@link pubfood#provider.BidProvider} bidding is complete.
 *
 * @param {string} bidProvider The [BidProvider]{@link pubfood#provider.BidProvider} name
 * @fires pubfood.PubfoodEvent.BID_COMPLETE
 */
AuctionMediator.prototype.doneBid = function(auctionIdx, auctionType, bidProvider) {
  // TODO consider having useful bid data available upon completion like the bids
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider);
  this.auctionRun[auctionIdx].bidStatus[bidProvider] = true;
  this.checkBids_(auctionIdx, auctionType);
};

/**
 * Get the auction count.
 * @return {number} the auction index
 * @private
 */
AuctionMediator.prototype.getAuctionCount = function() {
  return this.auctionIdx_;
};

/**
 * Get the auction identifier.<br>
 * @example
 * getAuctionId()
 * => iis9xx46a6v2x58e1b:3
 * @param {number} [auctionIdx] the auction count index
 * @return {string} the auction index
 * @private
 */
AuctionMediator.prototype.getAuctionId = function(auctionIdx) {
  var idx = auctionIdx || this.auctionIdx_;
  return this.id + ':' + idx;
};

/**
 * Get an auction run data set.<br>
 * @param {number} [auctionIdx] the auction count index
 * @return {AuctionRun}
 * @private
 */
AuctionMediator.prototype.getAuctionRun = function(auctionIdx) {
  var run = this.auctionRun[auctionIdx];
  return util.asType(run) === 'undefined' ? {} : run;
};

/**
 * Get the slots of an auction run.<br>
 * @param {number} [auctionIdx] the auction count index
 * @return {array.<Slot>}
 * @private
 */
AuctionMediator.prototype.getAuctionRunSlots = function(auctionIdx) {
  var run = this.auctionRun[auctionIdx];
  return util.asType(run) === 'undefined' ? {} : run.slots;
};

/**
 * Get the bids of an auction run.<br>
 * @param {number} [auctionIdx] the auction count index
 * @return {array.<Bid>}
 * @private
 */
AuctionMediator.prototype.getAuctionRunBids = function(auctionIdx) {
  var run = this.auctionRun[auctionIdx];
  return util.asType(run) === 'undefined' ? [] : run.bids;
};

/**
 * Get the late bids of an auction run.<br>
 * @param {number} [auctionIdx] the auction count index
 * @return {array.<Bid>}
 * @private
 */
AuctionMediator.prototype.getAuctionRunLateBids = function(auctionIdx) {
  var run = this.auctionRun[auctionIdx];
  return util.asType(run) === 'undefined' ? [] : run.lateBids;
};

/**
 * Get the targeting objects of an auction run.<br>
 * @param {number} [auctionIdx] the auction count index
 * @return {array.<TargetingObject>}
 * @private
 */
AuctionMediator.prototype.getAuctionRunTargeting = function(auctionIdx) {
  var run = this.auctionRun[auctionIdx];
  return util.asType(run) === 'undefined' ? [] : run.targeting;
};

/**
 * Prefix the bid provider default targeting key with the provider name.
 * @param {boolean} usePrefix turn prefixing off if false. Default: true.
 * @private
 */
AuctionMediator.prototype.prefixDefaultBidKey = function(usePrefix) {
  if (util.asType(usePrefix) === 'boolean') {
    this.prefix = usePrefix;
  }
  return this.prefix;
};

/**
 * Omit sending the bid provider default key/value to ad server.
 * @param {boolean} defaultBidKeyOff turn bid provider default targeting key off if false. Default: true.
 * @private
 */
AuctionMediator.prototype.omitDefaultBidKey = function(defaultBidKeyOff) {
  if (util.asType(defaultBidKeyOff) === 'boolean') {
    this.omitDefaultBidKey_ = defaultBidKeyOff;
  }
  return this.omitDefaultBidKey_;
};

util.extends(AuctionMediator, PubfoodObject);
module.exports = AuctionMediator;

},{"../assembler/bidassembler":2,"../assembler/requestassembler":3,"../assembler/transformoperator":4,"../event":6,"../model/bid":10,"../model/slot":11,"../provider/auctionprovider":12,"../provider/bidprovider":13,"../pubfoodobject":15,"../util":16}],10:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var PubfoodObject = require('../pubfoodobject');

/**
 * Bid is the result of a partner [BidProvider]{@link pubfood/provider.BidProvider} request.
 *
 * @class
 * @param {string|number} value the bid value. Default: empty string.
 * @memberof pubfood#model
 */
function Bid(value) {
  if (this.init_) {
    this.init_();
  }
  /** @property {Array.<number, number>} [sizes] the dimension sizes of the slot bid */
  this.sizes =  [];
  /** @property {string} [slot] the slot name */
  this.slot;
  /** @property {string|number} value the bid value. Default: empty string */
  this.value = value || 0;
  /** @property {string} type derived bid value type: from {@link util.asType}  */
  this.type = util.asType(this.value);
  /** @property {string} [label] optional label for adserver key targeting for bid value e.g. <code>label=2.00</code> */
  this.label;
  /** @property {string} [provider] the bid provider name */
  this.provider;
  /** @property {object} [targeting] ad server targeting key/values in addition to the bid value */
  this.targeting = {};
}

/**
 * Create a new [Bid]{@link pubfood#model.Bid} from an object.
 *
 * @param {BidObject} config bid object literal
 * @returns {pubfood#model.Bid|null} instance of [Bid]{@link pubfood#model.Bid}
 * @private
 */
Bid.fromObject = function(config) {
  var b = new Bid(), o = util.clone(config);
  for (var k in o) {
    b[k] = o[k];
  }
  var vType = util.asType(b.value);
  b.type = vType !== 'undefined' ? vType : '';
  return b;
};

/**
 * Sets the bid's value
 * @param {string|number} v the bid value for the ad server key/value targeting
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

util.extends(Bid, PubfoodObject);
module.exports = Bid;

},{"../pubfoodobject":15,"../util":16}],11:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var PubfoodObject = require('../pubfoodobject');
var slotConfig = require('../interfaces').SlotConfig;

/**
 * Slot contains a definition of a publisher ad unit.
 *
 * @class
 * @param {string} name the slot name
 * @param {string} elementId target DOM element id for the slot
 * @augments PubfoodObject
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

util.extends(Slot, PubfoodObject);
module.exports = Slot;

},{"../interfaces":7,"../pubfoodobject":15,"../util":16}],12:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var AuctionDelegate = require('../interfaces').AuctionDelegate;
var Event = require('../event');
var PubfoodObject = require('../pubfoodobject');

/**
 * AuctionProvider decorates the {@link AuctionDelegate} to implement the publisher ad server requests.
 *
 * @class
 * @property {string} name the name of the provider
 * @memberof pubfood#provider
 * @param {AuctionDelegate} auctionDelegate the delegate object that implements [libUri()]{@link pubfood#provider.AuctionProvider#libUri}, [init()]{@link pubfood#provider.AuctionProvider#init} and [refresh()]{@link pubfood#provider.AuctionProvider#refresh}
 * @augments PubfoodObject
 */
function AuctionProvider(auctionDelegate) {
  if (this.init_) {
    this.init_();
  }
  var delegate = auctionDelegate || {};
  this.name = delegate.name || '';
  this.auctionDelegate = delegate;
  this.timeout_ = delegate && delegate.timeout ? delegate.timeout : 0;
}

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
 * @param {array.<TargetingObject>} targeting - objects with bid targeting
 * @param {auctionDoneCallback} done - a callback to execute on init complete
 */
AuctionProvider.prototype.init = function(targeting, done) {
  this.auctionDelegate.init(targeting, done);
};

/**
 * Refresh for ad slots
 *
 * @param {array.<TargetingObject>} targeting - objects with bid level targeting
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

/**
 * Set the timeout by which a auction provider must call done
 * @param {number} millis the millisecond duration the auction provider has to push bids
 * @private
 */
AuctionProvider.prototype.timeout = function(millis) {
  this.timeout_ = util.asType(millis) === 'number' ? millis : 0;
};

/**
 * Get the timeout by which a auction provider must call done
 * @return {number} the millisecond duration the auction provider has to push bids
 * @private
 */
AuctionProvider.prototype.getTimeout = function() {
  return this.timeout_;
};

util.extends(AuctionProvider, PubfoodObject);
module.exports = AuctionProvider;

},{"../event":6,"../interfaces":7,"../pubfoodobject":15,"../util":16}],13:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('../util');
var BidDelegate = require('../interfaces').BidDelegate;
var Event = require('../event');
var PubfoodObject = require('../pubfoodobject');

/**
 * BidProvider implements bidding partner requests.
 *
 * @class
 * @param {BidDelegate} delegate the delegate object that implements [libUri()]{@link pubfood#provider.BidProvider#libUri}, [init()]{@link pubfood#provider.BidProvider#init} and [refresh()]{@link pubfood#provider.BidProvider#refresh}
 * @property {string} name the name of the provider
 * @augments PubfoodObject
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
    Event.publish(Event.EVENT_TYPE.WARN, 'BidProvider.bidDelegate.refresh not defined.');
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

util.extends(BidProvider, PubfoodObject);
module.exports = BidProvider;

},{"../event":6,"../interfaces":7,"../pubfoodobject":15,"../util":16}],14:[function(require,module,exports){
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
var AuctionMediator = require('./mediator/auctionmediator');

(function(global, undefined, ctor) {

  if (global) {
    module.exports = ctor(global, global.pfConfig || {});
  }

}(window || {}, undefined, function(global) {

  if(global.pubfood) {
    global.pubfood.library.logger.logEvent(Event.EVENT_TYPE.WARN, ['multiple api load']);
    return global.pubfood;
  }

  var pubfood = function(config) {
    return new pubfood.library.init(config);
  };

  pubfood.library = pubfood.prototype = {
    version: '0.2.0',
    PubfoodError: require('./errors'),
    logger: logger
  };

  /**
   * validate the api configurations
   * @param {object} pfo a the pubfood object
   * @private
   * @return {{hasError: boolean, details: string[]}}
   */
  var validateConfig = function(pfo) {
    var bidProviders = pfo.getBidProviders();

    // check for core api method calls
    for (var apiMethod in pfo.requiredApiCalls) {
      if (pfo.requiredApiCalls[apiMethod] === 0) {
        pfo.configErrors.push('"' + apiMethod + '" was not called');
      }
    }

    // validate through all the slots bid provider
    var slots = pfo.getSlots();
    for (var i = 0; i < slots.length; i++) {
      for (var k = 0; k < slots[i].bidProviders.length; k++) {
        var providerName = slots[i].bidProviders[k];
        // make sure there's config for each bid provider
        if (!bidProviders[providerName]) {
          pfo.configErrors.push('No configuration found for bid provider "' + providerName + '"');
        }
      }
    }

    return {
      hasError: pfo.configErrors.length > 0,
      details: pfo.configErrors
    };
  };

  /**
   * Creates a new Pubfood Bidding instance
   *
   * @alias pubfood
   * @constructor
   * @param {PubfoodConfig} [config] configuration properties object
   * @return {pubfood}
   * @deprecated pubfood constructor configuration object, see [PubfoodConfig]{@link typeDefs.PubfoodConfig}.
   * @example
   *   new pubfood({randomizeBidRequests: true,
   *                bidProviderCbTimeout: 5000,
   *                auctionProviderCbTimeout: 5000});
   */
  var api = pubfood.library.init = function(config) {
    this.mediator = new AuctionMediator();
    if (config) {
      this.randomizeBidRequests_ = !!config.randomizeBidRequests;
      this.mediator.setBidProviderCbTimeout(config.bidProviderCbTimeout);
      this.mediator.setAuctionProviderCbTimeout(config.auctionProviderCbTimeout);
    }

    Event.publish(Event.EVENT_TYPE.PUBFOOD_API_LOAD);
    this.pushApiCall_('api.init', arguments);
    this.configErrors = [];
    this.requiredApiCalls = {
      setAuctionProvider: 0,
      addBidProvider: 0,
    };
    this.util = util;
    return this;
  };

  /**
   * Push a call to the pubfood api for logging history.
   *
   * Adds the auctionId to the api call log.
   *
   * @param {string} name the api call nampe format \"api.<method name>\"
   * @param {arrayish} args the array or array like arguments to the call
   */
  api.prototype.pushApiCall_  = function (name, args) {
    this.library.logger.logCall(name, this.getAuctionId(), args);
  };

  /**
   * Get the auction identifier.
   *
   * Returns the <id>:<auction count>
   * @return {string} the auctionId
   */
  api.prototype.getAuctionId = function() {
    return this.mediator.getAuctionId();
  };

  /**
   *
   * @param {string} type
   */
  api.prototype.dumpLog = function(type){
    this.library.logger.dumpLog(type);
  };

  /**
   * Make this adslot avaialble for bidding
   *
   * @function
   * @param {SlotConfig} slot Slot configuration
   * @return {pubfood}
   */
  api.prototype.addSlot = function(slot) {

    if (util.isObject(slot) && (!util.isArray(slot.bidProviders) || slot.bidProviders.length === 0)) {
      slot.bidProviders = ['__default__'];
      if(!this.mediator.bidProviderExists_('__default__')){
        this.mediator.addBidProvider(defaultBidProvider);
      }
    }

    this.pushApiCall_('api.addSlot', arguments);
    var slotObject = this.mediator.addSlot(slot);
    this.requiredApiCalls.addSlot++;
    return slotObject;
  };

  /**
   * Get a list a of all registered slots
   * @return {Slot[]}
   */
  api.prototype.getSlots = function() {
    this.pushApiCall_('api.getSlots', arguments);
    var slots = [];
    for (var k in this.mediator.slotMap) {
      slots.push(this.mediator.slotMap[k]);
    }
    return slots;
  };

  /**
   * Get a slot object
   * @param {string} name the slot name
   * @return {Slot}
   */
  api.prototype.getSlot = function(name) {
    this.pushApiCall_('api.getSlot', arguments);
    return this.mediator.slotMap[name];
  };

  /**
   * Set the Auction Provider
   *
   * @function
   * @param {AuctionDelegate} delegate Auction provider configuration
   * @return {AuctionProvider|null}
   */
  api.prototype.setAuctionProvider = function(delegate) {
    this.pushApiCall_('api.setAuctionProvider', arguments);
    var provider = this.mediator.setAuctionProvider(delegate);
    var delegateName = delegate && delegate.name ? delegate.name : 'undefined';
    if (!provider) {
      this.configErrors.push('Invalid auction provider: ' + delegateName);
      return null;
    }
    this.requiredApiCalls.setAuctionProvider++;
    return provider;
  };

  /**
   * Get the Auction Provider
   * @return {pubfood#provider.AuctionProvider}
   */
  api.prototype.getAuctionProvider = function() {
    this.pushApiCall_('api.getAuctionProvider', arguments);
    return this.mediator.auctionProvider;
  };

  /**
   * Add a BidProvider
   *
   * @function
   * @param {BidDelegate} delegate Bid provider configuaration
   * @example
   var pf = new pubfood();
   pf.addBidProvider({
     name: 'BidProvider1',
     libUrl: '',
     init: function(slots, pushBid, done) {
     },
     refresh: function(slots, pushBid, done) {
     }
   });
   * @return {BidProvider|null}
   */
  api.prototype.addBidProvider = function(delegate) {

    this.pushApiCall_('api.addBidProvider', arguments);
    var provider = this.mediator.addBidProvider(delegate);
    var delegateName = delegate && delegate.name ? delegate.name : 'undefined';
    if (!provider) {
      this.configErrors.push('Invalid bid provider: ' + delegateName);
      return null;
    }
    this.requiredApiCalls.addBidProvider++;

    if(util.asType(delegate.init) === 'function' && delegate.init.length !== 3){
      this.configErrors.push('Bid provider '+ delegateName +'\'s init method requires 3 arguments');
    }
    if(util.asType(delegate.refresh) === 'function' && delegate.refresh.length !== 3){
      this.configErrors.push('Bid provider ' + delegateName + '\'s refresh method requires 3 arguments');
    }
    return provider;
  };

  /**
   * Gets a list of bid providers
   * @return {object.<BidProvider>}}
   */
  api.prototype.getBidProviders = function() {
    this.pushApiCall_('api.getBidProviders', arguments);
    return this.mediator.bidProviders;
  };

  /**
   * Gets a bid provider
   * @param {string} name the bid provider name
   * @return {BidProvider}
   */
  api.prototype.getBidProvider = function(name) {
    this.pushApiCall_('api.getBidProvider', arguments);
    return this.mediator.bidProviders[name];
  };

  /**
   * Add a custom reporter
   * @param {string} [eventType] the event to bind this reporter to
   * @param {reporter} reporter Custom reporter
   * @return {pubfood}
   * @example
   var pf = new pubfood();
   var reporter = function(event){
     console.log('my reporter', event.data);
   };
   pf.observe(reporter);
   */
  api.prototype.observe = function(eventType, reporter) {
    this.pushApiCall_('api.observe', arguments);
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
    this.pushApiCall_('api.timeout', arguments);
    this.mediator.timeout(millis);
    return this;
  };

  /**
   * Sets the default done callback timeout offset. Default: <code>5000ms</code>
   * <p>
   * If a [BidProvider.timeout]{@link pubfood#provider.BidProvider#timeout} value is not set, specifies the additional time in which a provider gets to push late bids and call [done()]{@link typeDefs.bidDoneCallback}.
   * <p>Assists capturing late bid data for analytics and reporting by giving additional timeout "grace" period.
   * <p>Bid provider timeout calculated as the following if not otherwise set:
   * <li><code>timeout(millis) + doneCallbackOffset(millis)</code></li>
   * <p>If the timeout elapses, done() is called on behalf of the provider.
   * @param {number} millis - milliseconds to set the timeout
   */
  api.prototype.doneCallbackOffset = function(millis) {
    this.mediator.doneCallbackOffset(millis);
  };

  /**
   * Sets a function delegate to initiate the publisher ad server request.
   *
   * @param {AuctionTriggerFn} delegate the function that makes the callback to start the auction
   * @return {pubfood}
   */
  api.prototype.setAuctionTrigger = function(delegate) {
    this.pushApiCall_('api.setAuctionTrigger', arguments);
    this.mediator.setAuctionTrigger(delegate);
    return this;
  };

  /**
   * Add bid transformation operator.
   *
   * @param {TransformDelegate} delegate - the delegate function
   * @return {pubfood}
   */
  api.prototype.addBidTransform = function(delegate) {
    this.pushApiCall_('api.addBidTransform', arguments);
    this.mediator.addBidTransform(delegate);
    return this;
  };

  /**
   * Add request transformation operator.
   *
   * @param {TransformDelegate} delegate - the delegate function
   * @return {pubfood}
   */
  api.prototype.addRequestTransform = function(delegate) {
    this.pushApiCall_('api.addRequestTransform', arguments);
    this.mediator.addRequestTransform(delegate);
    return this;
  };

  /**
   * Start the bidding process
   * @param {number} [startTimestamp] An optional timestamp that's used for calculating other time deltas.
   * @param {apiStartCallback} [startCb]
   * @return {pubfood}
   */
  api.prototype.start = function(startTimestamp, startCb) {
    this.pushApiCall_('api.start', arguments);

    var configStatus = validateConfig(this);

    if(typeof startCb === 'function'){
      startCb(configStatus.hasError, configStatus.details);
    }

    // only continue of there aren't any config errors
    if (!configStatus.hasError) {
      this.mediator.start(this.randomizeBidRequests_, startTimestamp);
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
    this.pushApiCall_('api.refresh', arguments);
    this.mediator.refresh(slotNames);
    return this;
  };

  /**
   * Prefix the bid provider default targeting key with the provider name.
   * @param {boolean} usePrefix turn prefixing off if false. Default: true.
   * @private
   */
  api.prototype.prefixDefaultBidKey = function(usePrefix) {
    this.mediator.prefixDefaultBidKey(usePrefix);
    return this;
  };

  /**
   * Omit the bid provider default key/value being sent to the ad server.
   * <p>
   * Pubfood will add the bid provider default key/value to the ad server
   * request unless omitted explicitly. Default key of the form: <code>&lt;name&gt;_&lt;label|bid&gt;=&lt;value&gt;</code>
   * <p>
   * If the default bid provider key/value is omitted, all ad server targeting
   * is dependent on the [TargetingObject.targeting]{@link typeDefs.TargetingObject} property.
   * @param {boolean} defaultBidKeyOff true turns the default bid key/value feature off.
   * @return {pubfood}
   * @example
   *
   * pubfood.omitDefaultBidKey(true)
   *
   * e.g. for the bid provider name: 'foo', prevents the 'foo_bid=' parameters shown below
   *
   * prev_iu_szs:300x250|300x600,728x90
   * prev_scp:foo_bid=400|foo_bid=200
   *
   * where;
   * <bidder>_<label|bid>=<value>
   */
  api.prototype.omitDefaultBidKey = function(defaultBidKeyOff) {
    this.mediator.omitDefaultBidKey(defaultBidKeyOff);
    return this;
  };

  api.prototype.library = pubfood.library;

  global.pubfood = pubfood;
  return pubfood;
}));

},{"./errors":5,"./event":6,"./interfaces":7,"./logger":8,"./mediator/auctionmediator":9,"./util":16}],15:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';

var util = require('./util');

/**
 * PubfoodObject is a base type for pubfood types.
 *
 * @class
 */
function PubfoodObject() {
  this.id = util.newId();
  this.params_ = {};
}

/**
 * Set an object parameter.
 *
 * @param {string|number|boolean} name the parameter name
 * @param {mixed} value the parameter value
 * @return {PubfoodObject} this slot
 */
PubfoodObject.prototype.setParam = function(name, value) {
  var type = util.asType(name);
  if (type !== 'object' && type !== 'array' && type !== 'function' && type !== 'undefined') {
    this.params_[name] = value;
  }
  return this;
};

/**
 * Get an object parameter.
 *
 * @param {string} name the parameter name
 * @return {mixed} the parameter value
 */
PubfoodObject.prototype.getParam = function(name) {
  return this.params_[name];
};

/**
 * Get all parameter keys.
 *
 * @return {string[]} this parameter key array
 */
PubfoodObject.prototype.getParamKeys = function() {
  var ret = [];
  for (var i in this.params_) {
    ret.push(this.params_[i]);
  }
  return ret;
};

module.exports = PubfoodObject;

},{"./util":16}],16:[function(require,module,exports){
/**
 * pubfood
 */

'use strict';
/**
 * @namespace util
 */
var util = {
  /**
   * Get the type name of an object.
   * For behavior,
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
      for (var i = 0; i < parents.length; i++) {
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
  /**
   * Merge two objects.
   * Where source and target share the same keys, source overwrites target key.
   * @param {object} target the target object
   * @param {object} source the source object
   * @return {object} the contents of o2 merged into o1
   */
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

},{}]},{},[14])(14)
});