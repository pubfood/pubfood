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
