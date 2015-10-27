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
      assert.isTrue(event.provider === 'validation', 'should be a validation error');
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
      init: function(slots, bids, options, done) {

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

    var onEvent = false;
    Event.on(Event.EVENT_TYPE.INVALID, function(event) {
      onEvent = true;
      assert.isTrue(event.provider === 'validation', 'should be a validation warning');
    });
    assert.isFalse(m.validate(), 'mediator should not be valid');
    // @todo hmmm, relies on synchronous event emit processing from 'validate'
    assert.isTrue(onEvent === true, 'should raise validation event');
  });

  it('should have slots with at least one bidder', function() {
    var m = new AuctionMediator();
    m.setAuctionProvider({
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, options, done) {

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

    var onEvent = false;
    Event.on(Event.EVENT_TYPE.INVALID, function(event) {
      onEvent = true;
      assert.isTrue(event.provider === 'validation', 'should be invalid');
    });
    assert.isFalse(m.validate(), 'mediator should not be valid');
    // @todo hmmm, relies on synchronous event emit processing from 'validate'
    assert.isTrue(onEvent === true, 'should raise validation event');
  });

  it('should have at least one slot', function() {
    var m = new AuctionMediator();
    m.setAuctionProvider({
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, options, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    });

    var onEvent = false;
    Event.on(Event.EVENT_TYPE.INVALID, function(event) {
      onEvent = true;
      assert.isTrue(event.provider === 'validation', 'should be a validation warning');
    });
    assert.isFalse(m.validate(), 'mediator should not be valid');
    // @todo hmmm, relies on synchronous event emit processing from 'validate'
    assert.isTrue(onEvent === true, 'should raise validation event');
  });

  it('should raise warning on setAuctionProvider with existing provider', function() {
    var m = new AuctionMediator();

    var providerDelegate = {
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, options, done) {

      },
      refresh: function(slots, targeting, done) {
      }
    };

    m.setAuctionProvider(providerDelegate);
    m.setAuctionProvider(providerDelegate);

    var log = logger.history[logger.history.length - 1];
    assert.isTrue(log.args[0] === 'WARN');
    assert.isTrue(log.args[1] === 'Warning: auction provider exists: Google');
    assert.isTrue(log.args[2] === 'auctionmediator');

  });

  it('should create an auctionState map', function() {
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
      init: function(slots, options, pushBid, done) {

      },
      refresh: function(slots, options, pushBid, done) {
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
      init: function(slots, options, pushBid, done) {

      },
      refresh: function(slots, options, pushBid, done) {
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
});
