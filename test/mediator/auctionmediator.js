/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
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
  it('should set a timeout', function() {
    var m = new AuctionMediator();
    m.timeout(1000);
    assert.isTrue(m.getTimeout() === 1000, 'timeout not set');
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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    m.addSlot({
      name: '/2476204/multi-size',
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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    m.addSlot({
      name: '/2476204/multi-size',
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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    };

    m.setAuctionProvider(providerDelegate);
    m.setAuctionProvider(providerDelegate);

    var log = logger.history[logger.history.length - 1];

    assert.isTrue(log.args[0] === 'WARN');
    assert.isTrue(log.args[1] === 'Warning: auction provider exists: Google');

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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    m.start();

  });

  it('should handle push next', function() {
    delete Event._events;
    Event._events = {};
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
    console.log('bidKey: ' + bidKey);
    assert.isTrue(bidKey === 'bid', 'should not have a prefix.');
  });
});
