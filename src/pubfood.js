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

  if(global.pubfood){
    global.pubfood.library.logger.logEvent(Event.EVENT_TYPE.WARN, ['multiple api load']);
    return global.pubfood;
  }

  var pubfood = function(config) {
    return new pubfood.library.init(config);
  };

  var configErrors = [];

  var requiredApiCalls = {
    setAuctionProvider: 0,
    addBidProvider: 0,
  };

  pubfood.library = pubfood.prototype = {
    version: 'APP_VERSION',
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
    for (var apiMethod in requiredApiCalls) {
      if (requiredApiCalls[apiMethod] === 0) {
        configErrors.push('"' + apiMethod + '" was not called');
      }
    }

    // validate through all the slots bid provider
    var slots = pfo.getSlots();
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
    this.mediator = new AuctionMediator();
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
      if(!this.mediator.bidProviderExists_('__default__')){
        this.mediator.addBidProvider(defaultBidProvider);
      }
    }

    logger.logCall('api.addSlot', arguments);
    var slotObject = this.mediator.addSlot(slot);
    requiredApiCalls.addSlot++;
    return slotObject;
  };

  /**
   * Get a list a of all registered slots
   * @return {Slot[]}
   */
  api.prototype.getSlots = function() {
    logger.logCall('api.getSlots', arguments);
    return this.mediator.slots;
  };

  /**
   * Get a slot object
   * @param {string} name the slot name
   * @return {Slot}
   */
  api.prototype.getSlot = function(name) {
    logger.logCall('api.getSlot', arguments);
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
    logger.logCall('api.setAuctionProvider', arguments);
    var provider = this.mediator.setAuctionProvider(delegate);
    this.mediator.setAuctionProviderCbTimeout(this.auctionProviderTimeout_);
    requiredApiCalls.setAuctionProvider++;
    if (!provider) {
      configErrors.push('Invalid auction provider config');
    }
    return provider;
  };

  /**
   * Get the Auction Provider
   * @return {pubfood#provider.AuctionProvider}
   */
  api.prototype.getAuctionProvider = function() {
    logger.logCall('api.getAuctionProvider', arguments);
    return this.mediator.auctionProvider;
  };

  /**
   * Add a BidProvider
   *
   * @function
   * @param {BidDelegate} delegate Bid provider configuaration
   * @example {file} ../examples/add-bid-provider.js
   * @return {BidProvider|null}
   */
  api.prototype.addBidProvider = function(delegate) {
    logger.logCall('api.addBidProvider', arguments);
    var provider = this.mediator.addBidProvider(delegate);
    this.mediator.setBidProviderCbTimeout(this.bidProviderTimeout_);
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
    return provider;
  };

  /**
   * Gets a list of bid providers
   * @return {object.<BidProvider>}}
   */
  api.prototype.getBidProviders = function() {
    logger.logCall('api.getBidProviders', arguments);
    return this.mediator.bidProviders;
  };

  /**
   * Gets a bid provider
   * @param {string} name the bid provider name
   * @return {BidProvider}
   */
  api.prototype.getBidProvider = function(name) {
    logger.logCall('api.getBidProvider', arguments);
    return this.mediator.bidProviders[name];
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
    this.mediator.timeout(millis);
    return this;
  };

  /**
   * Sets a function delegate to initiate the publisher ad server request.
   *
   * @param {AuctionTriggerFn} delegate the function that makes the callback to start the auction
   * @return {pubfood}
   */
  api.prototype.setAuctionTrigger = function(delegate) {
    logger.logCall('api.setAuctionTrigger', arguments);
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
    logger.logCall('api.addBidTransform', arguments);
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
    logger.logCall('api.addRequestTransform', arguments);
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
    Event.publish(Event.EVENT_TYPE.PUBFOOD_API_START, startTimestamp);
    logger.logCall('api.start', arguments);

    var configStatus = validateConfig(this);

    if(typeof startCb === 'function'){
      startCb(configStatus.hasError, configStatus.details);
    }

    // only continue of there aren't any config errors
    if (!configStatus.hasError) {
      this.mediator.start(this.randomizeBidRequests_);
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
    this.mediator.refresh(slotNames);
    return this;
  };

  api.prototype.library = pubfood.library;

  global.pubfood = pubfood;
  return pubfood;
}));
