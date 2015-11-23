/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var AuctionMediator = require('../../src/mediator/auctionmediator');
var Event = require('../../src/event');
var logger = require('../../src/logger');
var Bid = require('../../src/model/bid');
/** @todo generalize fixture config to improve readability of tests */
describe('Pubfood AuctionMediator', function testPubfoodMediator() {

  function clearEvents() {
    Event.removeAllListeners();
    Event.observeImmediate_ = null;
    Event.observeImmediate_ = {};
  }

  beforeEach(function() {
    clearEvents();
  });

  afterEach(function() {
    clearEvents();
  });

  it('should set a timeout', function() {
    var m = new AuctionMediator();
    m.timeout(1000);
    assert.isTrue(m.getTimeout() === 1000, 'timeout not set');
  });

  it('should count bid providers by slot allocation', function() {
    var m1 = new AuctionMediator();

    m1.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'b1',
        'b2',
        'b3'
      ]
    });

    var bidderSlots = m1.getBidderSlots();

    assert.isTrue(bidderSlots.length === 0, 'm1 should have zero BidProviders for requests');
    assert.isUndefined(m1.bidStatus['b1'], 'm1 should not track BidProvider b1');
    assert.isUndefined(m1.bidStatus['b2'], 'm1 should not track BidProvider b2');
    assert.isUndefined(m1.bidStatus['b3'], 'm1 should not track BidProvider b3');

    m1 = null;
    m1 = new AuctionMediator();

    m1.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'b1',
        'b2',
        'b3'
      ]
    });

    m1.addBidProvider({
      name: 'b2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });

    bidderSlots = m1.getBidderSlots();

    assert.isTrue(bidderSlots.length === 1, 'm1 should have one BidProvider for requests');
    assert.isUndefined(m1.bidStatus['b1'], 'm1 should not track BidProvider b1');
    assert.isUndefined(m1.bidStatus['b3'], 'm1 should not track BidProvider b3');

    assert.isDefined(m1.bidStatus['b2'], 'm1 should track BidProvider b2');
    assert.isFalse(m1.bidStatus['b2'], 'BidProvider b2 should not have bid status complete');

    var m2 = new AuctionMediator();

    m2.addBidProvider({
      name: 'b2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });

    bidderSlots = m2.getBidderSlots();

    assert.isTrue(bidderSlots.length === 0, 'm2 should have zero BidProviders for requests');
    assert.isUndefined(m2.bidStatus['b2'], 'm2 should not track BidProvider b2');

    m2 = null;
    m2 = new AuctionMediator();

    m2.addBidProvider({
      name: 'b2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m2.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'b3'
      ]
    });

    bidderSlots = m2.getBidderSlots();

    assert.isTrue(bidderSlots.length === 0, 'm2 should have zero BidProviders for requests');
    assert.isUndefined(m2.bidStatus['b3'], 'm2 should not track BidProvider b3');

    m2 = null;
    m2 = new AuctionMediator();

    m2.addBidProvider({
      name: 'b2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m2.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'b3'
      ]
    });

    m2.addSlot({
      name: '/0000000/leaderboard',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: [
        'b2'
      ]
    });

    bidderSlots = m2.getBidderSlots();

    assert.isTrue(bidderSlots.length === 1, 'm2 should have one BidProvider for requests');
    assert.isDefined(m2.bidStatus['b2'], 'm2 should track BidProvider b2');
    assert.isFalse(m2.bidStatus['b2'], 'm2 BidProvider b2 should not have bid status complete');
  });

  it('should start an auction when all bidders are done', function() {
    var m = new AuctionMediator();
    m.addBidProvider({
      name: 'b1',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'b1'
      ]
    });

    m.setAuctionProvider({
      name: 'p1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, bids, done) {
        done();
      },
      refresh: function(slots, targeting, done) {
        done();
      }
    });

    var bidderSlots = m.getBidderSlots();

    Event.publish('BID_COMPLETE', 'b1');

    Event.on(Event.EVENT_TYPE.BID_COMPLETE, function(evt) {
      assert.isTrue(evt.data === 'b1');
    });

    m.checkBids_('b1');

    Event.on(Event.EVENT_TYPE.AUCTION_GO, function(evt) {
      assert.isTrue(evt.data === 'p1');
    });
  });

  it('should be valid to start auction', function() {
    var m = new AuctionMediator();

    var onEvent = false;
    Event.on(Event.EVENT_TYPE.INVALID, function(event) {
      onEvent = true;
      assert.isDefined(Event._events, 'validation event not published');
      assert.isTrue(event.type === 'INVALID', 'should be an error event');
    });
    assert.isFalse(m.validate(), 'mediator should not be valid');
    // @todo hmmm, relies on synchronous event emit processing from 'validate'
    assert.isTrue(onEvent === true, 'should raise validation event');
  });

  it('should have bidProviders', function() {
    var m = new AuctionMediator();
    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    m.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: {
        yieldbot: {
          slot: 'medrec'
        },
        bidderFast: {
          slot: 'fastSlot'
        },
        bidderSlow: {
          slot: 'slowSlot'
        }
      }
    });

    assert.isFalse(m.validate(), 'mediator should not be valid');
  });

  it('should have slots with at least one bidder', function() {
    var m = new AuctionMediator();
    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    m.addSlot({
      name: '/0000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: {
      }
    });

    assert.isFalse(m.validate(), 'mediator should not be valid');
  });

  it('should have at least one slot', function() {
    var m = new AuctionMediator();
    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    assert.isFalse(m.validate(), 'mediator should not be valid');
  });

  it('should raise warning on setAuctionProvider with existing provider', function() {
    var m = new AuctionMediator();

    var providerDelegate = {
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    };

    m.setAuctionProvider(providerDelegate);
    m.setAuctionProvider(providerDelegate);

    var log = logger.history[logger.history.length - 1];

    assert.isTrue(log.args[0] === 'WARN');
    assert.isTrue(log.args[1] === 'Warning: auction provider exists: provider1');

  });

  it('should build provider slot array', function() {
    var m = new AuctionMediator();

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: [ 'p1' ]
    });
    m.addSlot({
      name: '/abc/456',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: [ 'p1', 'p2' ]
    });

    m.addBidProvider({
      name: 'p1',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });
    m.addBidProvider({
      name: 'p2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    m.start();

  });

  it('should handle push next', function() {

    var m = new AuctionMediator();

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: {
        p1: {
          slot: 's1'
        }
      }
    });

    m.addBidProvider({
      name: 'p1',
      libUri: '',
      init: function(slots, pushBid, done) {

      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m.init();
    var b = Bid.fromObject({
      slot: '/abc/123',
      value: '235',
      sizes: [728, 90],
      targeting: { foo: 'bar' }
    });
    Event.publish(Event.EVENT_TYPE.BID_PUSH_NEXT, b, 'p1');

    var log = logger.history[logger.history.length - 1];
    assert.isTrue(log.args[2] === 'p1');
  });

  it('should set a bid prefix', function() {
    var m = new AuctionMediator();
    assert.isTrue(m.prefix, 'prefix should be set to true');

    var b = Bid.fromObject({
      slot: '/abc/123',
      value: '235',
      sizes: [728, 90],
      targeting: { foo: 'bar' }
    });

    b.provider = 'p1';
    var bidKey = m.getBidKey(b);
    assert.isTrue(bidKey === 'p1_bid', 'incorrect bid prefix. default is to prefix.');

    b.label = 'theBid';
    bidKey = m.getBidKey(b);
    assert.isTrue(bidKey === 'p1_theBid', 'should have both prefix and label');

    m = new AuctionMediator({prefix: false});
    b.label = null;
    bidKey = m.getBidKey(b);
    assert.isTrue(bidKey === 'bid', 'should not have a prefix.');
  });
});
