/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
require('../common');
var assert = require('chai').assert;
var AuctionMediator = require('../../src/mediator/auctionmediator');
var Event = require('../../src/event');
var logger = require('../../src/logger');
var Bid = require('../../src/model/bid');
/** @todo generalize fixture config to improve readability of tests */
describe('Pubfood AuctionMediator', function testPubfoodMediator() {

  var TEST_MEDIATOR;
  beforeEach(function() {
    Event.removeAllListeners();

    TEST_MEDIATOR = null;
    TEST_MEDIATOR = new AuctionMediator();

    TEST_MEDIATOR.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    TEST_MEDIATOR.addBidProvider({
      name: 'b1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '235',
          sizes: [728, 90],
          targeting: { foo: 'bar' }
        });

        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    TEST_MEDIATOR.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

  });

  it('should set a timeout', function() {
    var m = new AuctionMediator();
    m.timeout(1000);
    assert.isTrue(m.getTimeout() === 1000, 'timeout not set');
  });

  it('should keep bidder status flag', function() {
    var m1 = new AuctionMediator();
    m1.bidStatus['b1'] = true;
    m1.bidStatus['b2'] = true;
    m1.bidStatus['b3'] = true;
    m1.bidStatus['b4'] = true;
    assert.isTrue(m1.allBiddersDone(), 'all bidders should be done');

    m1.bidStatus['b1'] = true;
    m1.bidStatus['b2'] = false;
    m1.bidStatus['b3'] = true;
    m1.bidStatus['b4'] = false;
    assert.isFalse(m1.allBiddersDone(), 'all bidders should not be done');
  });

  it('should test bid providers done by status flag', function() {
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

    m1.addBidProvider({
      name: 'b1',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m1.addBidProvider({
      name: 'b2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m1.addBidProvider({
      name: 'b3',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
      }
    });

    m1.setAuctionProvider({
      name: 'p1',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    m1.start();

    assert.equal(m1.allBiddersDone(), true, 'all bidders done should be true');
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
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    var bidderSlots = m.getBidderSlots();

    Event.publish('BID_COMPLETE', 'b1');

    Event.on(Event.EVENT_TYPE.BID_COMPLETE, function(evt) {
      assert.isTrue(evt.data === 'b1');
    });

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
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
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
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
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
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    assert.isFalse(m.validate(), 'mediator should not be valid');
  });

  it('should raise warning on setAuctionProvider with existing provider', function() {
    var m = new AuctionMediator();

    var providerDelegate = {
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    };

    m.setAuctionProvider(providerDelegate);
    m.setAuctionProvider(providerDelegate);

    var log = logger.history[logger.history.length - 1];

    assert.isTrue(log.args[0] === 'WARN');
    assert.isTrue(log.args[1] === 'Warning: auction provider exists: provider1');

  });

  it('should build provider slot array', function(done) {
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
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    m.addBidProvider({
      name: 'p2',
      libUri: 'someUri',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    m.start();

    assert.isTrue(m.slots.length === 2, 'should have two slots');
    assert.isTrue(m.auctionProvider.name === 'provider1', 'should have the named auctionProvider');
    assert.isDefined(m.bidProviders['p1'], 'bidProvider p1 should be defined');
    assert.isDefined(m.bidProviders['p2'], 'bidProvider p2 should be defined');

    done();
  });

  it('should handle push next', function() {

    var m = new AuctionMediator();

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '235',
          sizes: [728, 90],
          targeting: { foo: 'bar' }
        });
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.on(Event.EVENT_TYPE.BID_COMPLETE, function(event) {
      assert.isTrue(m.bids_[0].value === '235', 'bidProvider p1 should pushNext value');
      assert.deepEqual(m.bids_[0].targeting, { foo: 'bar' }, 'bidProvider p1 should pushNext targeting');
      assert.isTrue(event.data === 'b1', 'bidProvider b1 should be doneBid');
    });

    m.start();
  });

  it('should handle processBids', function(done) {

    var m = new AuctionMediator();

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '235',
          sizes: [728, 90],
          targeting: { foo: 'bar' }
        });

        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    m.start();

    assert.isTrue(m.bids_[0]['value'] === '235', 'bidProvider p1 should pushNext');

    Event.on(Event.EVENT_TYPE.BID_COMPLETE, function(event) {
      assert.isTrue(event.data === 'b1', 'bidProvider b1 should be doneBid');
      done();
    });
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

  describe('Auction Triggers', function() {

    global.ctx = {
      called: false
    };

    it('should handle an auction trigger', function() {

      TEST_MEDIATOR.setAuctionTrigger(function(startAuction) {
        ctx.called = true;
        setTimeout(function() {
          startAuction();
        }, 1);
      });

      TEST_MEDIATOR.start();

      assert.isTrue(ctx.called, 'trigger function global context not used');
    });

    it('should not error on undefined auction trigger', function() {
      TEST_MEDIATOR.setAuctionTrigger();
      TEST_MEDIATOR.start();
    });

    it('should not error on invalid auction trigger', function() {
      TEST_MEDIATOR.setAuctionTrigger('function');
      TEST_MEDIATOR.start();
    });
  });

  describe('Build targeting', function() {
    it('should build a bid map for slots', function() {
      var bid = new Bid(87);
      bid.slot = TEST_MEDIATOR.slots[0].name;
      TEST_MEDIATOR.bids_.push(bid);
      var bidMap = TEST_MEDIATOR.getBidMap_();
      assert.equal(bidMap[TEST_MEDIATOR.slots[0].name].length, 1, 'should have one slot targeting bidMap entry');
    });

    it('should build a bid map for a page', function() {
      var bid = new Bid(87);
      TEST_MEDIATOR.bids_.push(bid);
      var bidMap = TEST_MEDIATOR.getBidMap_();
      assert.equal(bidMap[AuctionMediator.PAGE_BIDS].length, 1, 'should have one page targeting bidMap entry');
    });

    it('should build a bid map for a slot and page', function() {
      var bid = new Bid(87);
      bid.slot = TEST_MEDIATOR.slots[0].name;
      TEST_MEDIATOR.bids_.push(bid);
      TEST_MEDIATOR.bids_.push(new Bid(37));
      var bidMap = TEST_MEDIATOR.getBidMap_();
      assert.equal(bidMap[TEST_MEDIATOR.slots[0].name].length, 1, 'should have one slot and one page targeting bidMap entry');
      assert.equal(bidMap[AuctionMediator.PAGE_BIDS].length, 1, 'should have one slot and one page targeting bidMap entry');
    });

    it('should build slot targeting', function() {
      var bid = new Bid(87);
      bid.slot = TEST_MEDIATOR.slots[0].name;
      TEST_MEDIATOR.bids_.push(bid);
      var auctionTargeting = TEST_MEDIATOR.buildTargeting_();
      assert.equal(auctionTargeting.length, 1, 'should have one targeting object');
      assert.equal(auctionTargeting[0].name, bid.slot, 'should have slot name: ' + bid.slot);
    });

    it('should build page targeting', function() {
      var bid = new Bid(87);
      TEST_MEDIATOR.bids_.push(bid);
      var auctionTargeting = TEST_MEDIATOR.buildTargeting_();
      assert.equal(auctionTargeting.length, 2, 'should have two targeting objects');
      assert.isUndefined(auctionTargeting[1].name, 'should have page targeting object');
    });

    it('should build slot targeting without a bid', function() {
      var auctionTargeting = TEST_MEDIATOR.buildTargeting_();
      assert.equal(auctionTargeting.length, 1, 'should have one slot targeting object without a bid');
      assert.equal(auctionTargeting[0].name, TEST_MEDIATOR.slots[0].name, 'should have slot name: ' + TEST_MEDIATOR.slots[0].name);
    });

    it('should build a bid key', function() {
      var bid = new Bid(87);
      for (var i in TEST_MEDIATOR.bidProviders) {
        bid.provider = TEST_MEDIATOR.bidProviders[i].name;
      }
      var bidKey = TEST_MEDIATOR.getBidKey(bid);
      assert.equal(bidKey, bid.provider + '_bid', 'bid key should be \"' + bid.provider + '_bid\"');
    });

    it('should build a bid key with label', function() {
      var bid = new Bid(87);
      bid.label = 'zzz';
      for (var i in TEST_MEDIATOR.bidProviders) {
        bid.provider = TEST_MEDIATOR.bidProviders[i].name;
      }
      var bidKey = TEST_MEDIATOR.getBidKey(bid);
      assert.equal(bidKey, bid.provider + '_zzz', 'bid key should be \"' + bid.provider + '_zzz\"');
    });

    it('should build a bid key with label and without prefix', function() {
      var bid = new Bid(87);
      bid.label = 'zzz';
      TEST_MEDIATOR.prefix = false;
      for (var i in TEST_MEDIATOR.bidProviders) {
        bid.provider = TEST_MEDIATOR.bidProviders[i].name;
      }
      var bidKey = TEST_MEDIATOR.getBidKey(bid);
      assert.equal(bidKey, 'zzz', 'bid key should be \"zzz\"');
    });
  });

  describe('Timeout values', function() {
    it('should set the timeout value', function() {
      TEST_MEDIATOR.timeout(5);
      assert.equal(TEST_MEDIATOR.getTimeout(), 5, 'timeout value should be 5');
    });

    it('timeout should be a numeric type', function() {
      TEST_MEDIATOR.timeout('5');
      assert.equal(TEST_MEDIATOR.getTimeout(), 2000, 'timeout value should be the default: 2000');
    });

    it('should set the auction provider callback timeout value', function() {
      TEST_MEDIATOR.setAuctionProviderCbTimeout(5);
      assert.equal(TEST_MEDIATOR.initDoneTimeout_, 5, 'auction provider callback timeout value should be 5');
    });

    it('auction provider callback timeout should be a numeric type', function() {
      TEST_MEDIATOR.setAuctionProviderCbTimeout('5');
      assert.equal(TEST_MEDIATOR.initDoneTimeout_, 2000, 'auction provider timeout value should be the default: 2000');
    });

    it('should set the bid provider callback timeout value', function() {
      TEST_MEDIATOR.setBidProviderCbTimeout(5);
      assert.equal(TEST_MEDIATOR.callbackTimeout_, 5, 'bid provider callback timeout value should be 5');
    });

    it('bid provider callback timeout should be a numeric type', function() {
      TEST_MEDIATOR.setBidProviderCbTimeout('5');
      assert.equal(TEST_MEDIATOR.callbackTimeout_, 2000, 'bid provider timeout value should be the default: 2000');
    });
  });
});
