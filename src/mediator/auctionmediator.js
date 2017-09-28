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
  this.throwErrors_ = false;
  Event.setAuctionId(this.getAuctionId());
}

AuctionMediator.PAGE_BIDS = 'page';
AuctionMediator.AUCTION_TYPE = { START: Event.ANNOTATION_TYPE.AUCTION_TYPE.INIT, REFRESH: Event.ANNOTATION_TYPE.AUCTION_TYPE.REFRESH};
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
AuctionMediator.prototype.newAuctionRun = function(auctionType, slotNames) {
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
    timeoutId: 0,
    inAuction: AuctionMediator.IN_AUCTION.FALSE,
    slots: auctionSlots,
    bids: [],
    lateBids: [],
    bidStatus: {},
    targeting: [],
    auctionType: auctionType || AuctionMediator.AUCTION_TYPE.START
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
AuctionMediator.prototype.startAuction_ = function(auctionIdx, auctionType, forcedDone) {
  clearTimeout(this.auctionRun[auctionIdx].timeoutId);
  this.auctionRun[auctionIdx].timeoutId = 0;
  Event.publish(Event.EVENT_TYPE.BID_ASSEMBLER, 'AuctionMediator');
  if (this.bidAssembler.operators.length > 0) {
    this.auctionRun[auctionIdx].bids = this.bidAssembler.process(this.auctionRun[auctionIdx].bids);
  }
  this.processTargeting_(auctionIdx, auctionType, forcedDone);
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
    this.auctionRun[auctionIdx].timeoutId = setTimeout(function() {
      startFn(idx, type, true);
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
        value: bid.value,
        provider: bid.provider,
        id: bid.id,
        targeting: bid.targeting || {}
      });

      if (!this.omitDefaultBidKey()) {
        var bidKey = this.getBidKey(bid);
        tgtObject.targeting[bidKey] = tgtObject.targeting[bidKey] || bid.value;
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
      value: bid.value,
      provider: bid.provider,
      id: bid.id,
      targeting: bid.targeting
    });

    if (!this.omitDefaultBidKey()) {
      var bidKey = this.getBidKey(bid);
      pgTgtObject.targeting[bidKey] = pgTgtObject.targeting[bidKey] || bid.value;
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
  var cbTimeoutId;
  var auctionTimeoutId = this.auctionRun[auctionIdx].timeoutId;

  var doneCb = function(annotations) {
    var eventAnnotations = {};
    Event.newEventAnnotation(Event.ANNOTATION_TYPE.AUCTION_TYPE.NAME, auctionType, 'Done auction type: ' + auctionType, eventAnnotations);

    for (var annotationName in annotations) {
      eventAnnotations[annotationName] = annotations[annotationName];
    }

    if (!doneCalled) {
      doneCalled = true;
      clearTimeout(cbTimeoutId);
      self.auctionDone(idx, name, eventAnnotations);
    }
  };

  cbTimeoutId = setTimeout(function() {
    if (!doneCalled) {
      if (auctionTimeoutId) {
        clearTimeout(auctionTimeoutId);
      }
      var msg = 'The auction done callback for "' + name + '" hasn\'t been called within the allotted time (' + (cbTimeout / 1000) + 'sec)';
      var timeoutAnnotation = Event.newEventAnnotation(Event.ANNOTATION_TYPE.FORCED_DONE.NAME, Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT, msg);
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning:' + msg);

      doneCb(timeoutAnnotation);
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

  try {
    if (auctionType === AuctionMediator.AUCTION_TYPE.START) {
      self.auctionProvider.init(targeting, doneCb);
    } else {
      self.auctionProvider.refresh(targeting, doneCb);
    }
  } catch (err) {
    Event.publish(Event.EVENT_TYPE.ERROR, err);
    var errorAnnotation = Event.newEventAnnotation(Event.ANNOTATION_TYPE.FORCED_DONE.NAME, Event.ANNOTATION_TYPE.FORCED_DONE.ERROR, err.message);
    doneCb(errorAnnotation);
    if (self.auctionProvider.throwErrors()) {
      throw err;
    }
  }
};

/**
 * Notification of auction complete
 *
 * @param {number} auctionIdx Index to the [AuctionRun]{@link typeDefs.AuctionRun} data object
 * @param {string} data The auction mediator's name
 * @param {boolean} forcedDone Pubfood has initiated the auction if true
 * @fires AUCTION_COMPLETE
 */
AuctionMediator.prototype.auctionDone = function(auctionIdx, data, annotations) {
  this.auctionRun[auctionIdx].inAuction = AuctionMediator.IN_AUCTION.DONE;
  var auctionTargeting = this.getAuctionRun(auctionIdx).targeting;
  Event.publish(Event.EVENT_TYPE.AUCTION_COMPLETE, { name: data, targeting: auctionTargeting }, annotations);
  setTimeout(function() {
    // push this POST event onto the next tick of the event loop
    Event.publish(Event.EVENT_TYPE.AUCTION_POST_RUN, data, annotations);
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
      bidProvider.throwErrors(this.throwErrors_);
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
    auctionProvider.throwErrors(this.throwErrors_);
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
  var auctionIdx = this.newAuctionRun(AuctionMediator.AUCTION_TYPE.START);
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
  var auctionIdx = this.newAuctionRun(AuctionMediator.AUCTION_TYPE.REFRESH, slotNames);
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
  var bidDoneCb = function(annotations) {
    var eventAnnotations = {};
    Event.newEventAnnotation(Event.ANNOTATION_TYPE.AUCTION_TYPE.NAME, auctionType, 'Done auction type: ' + auctionType, eventAnnotations);

    for (var annotationName in annotations) {
      eventAnnotations[annotationName] = annotations[annotationName];
    }
    if (!doneCalled) {
      doneCalled = true;
      clearTimeout(timeoutId);
      self.doneBid(idx, auctionType, name, eventAnnotations);
    }
  };

  timeoutId = setTimeout(function(){
    if(!doneCalled) {
      var msg = 'The bid done callback for "'+name+'" hasn\'t been called within the allotted time (' + (cbTimeout/1000) + 'sec)';
      Event.publish(Event.EVENT_TYPE.WARN, 'Warning: ' + msg);
      var timeoutAnnotation = Event.newEventAnnotation(Event.ANNOTATION_TYPE.FORCED_DONE.NAME, Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT, msg);
      bidDoneCb(timeoutAnnotation);
    }
  }, cbTimeout);

  Event.publish(Event.EVENT_TYPE.BID_START, name);
  try {
    if (auctionType === AuctionMediator.AUCTION_TYPE.START) {
      provider.init(slots, pushBidCb, bidDoneCb);
    } else {
      provider.refresh(slots, pushBidCb, bidDoneCb);
    }
  } catch (err) {
    Event.publish(Event.EVENT_TYPE.ERROR, err);
    var errorAnnotation = Event.newEventAnnotation(Event.ANNOTATION_TYPE.FORCED_DONE.NAME, Event.ANNOTATION_TYPE.FORCED_DONE.ERROR, err.message);
    bidDoneCb(errorAnnotation);
    if (provider.throwErrors()) {
      throw err;
    }
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
AuctionMediator.prototype.doneBid = function(auctionIdx, auctionType, bidProvider, annotations) {
  // TODO consider having useful bid data available upon completion like the bids
  Event.publish(Event.EVENT_TYPE.BID_COMPLETE, bidProvider, annotations);
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
 * Get auction run type.<br>
 * [ANNOTATION_TYPE.AUCTION_TYPE.INIT]{@link PubfoodEvent#ANNOTATION_TYPE}<br>
 * [ANNOTATION_TYPE.AUCTION_TYPE.REFRESH]{@link PubfoodEvent#ANNOTATION_TYPE}
 * @param {number} [auctionIdx] the auction count index
 * @return {string}
 * @private
 */
AuctionMediator.prototype.getAuctionRunType = function(auctionIdx) {
  return this.auctionRun[auctionIdx].auctionType;
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

/**
 * Re-throw caught delegate errors.
 * Default: false<br><br>
 * The [throwErrors]{@link PubfoodProvider#throwErrors} property for
 * all [BidDelegate]{@link typeDefs.BidDelegate} and [AuctionDelegate]{@link typeDefs.AuctionDelegate} providers will be set.
 * @param {boolean} [silent] if true: re-throw errors in [BidDelegate]{@link typeDefs.BidDelegate} and [AuctionDelegate]{@link typeDefs.AuctionDelegate} functions
 * @return {pubfood}
 */
AuctionMediator.prototype.throwErrors = function(silent) {
  if (util.asType(silent) === 'boolean') {
    this.throwErrors_ = silent;

    this.throwErrors_ = this.auctionProvider ? this.auctionProvider.throwErrors(silent) : this.throwErrors_;
    for (var idx in this.bidProviders) {
      var bidProvider = this.bidProviders[idx];
      this.throwErrors_ = bidProvider ? bidProvider.throwErrors(silent) : this.throwErrors_;
    }
  }
  return this.throwErrors_;
};

/**
 * Get the [AuctionMediator]{@link pubfood#mediator.AuctionMediator} event emitter instance.
 * <br><br>  The singleton {@link PubfoodEvent} emitter reference is shared among
 * {@link pubfood} objects.
 * @returns {PubfoodEvent} the {@link pubfood} emitter singleton reference
 * @private
 */
AuctionMediator.prototype.getEventEmitter = function() {
  return Event;
};

util.extendsObject(AuctionMediator, PubfoodObject);
module.exports = AuctionMediator;
