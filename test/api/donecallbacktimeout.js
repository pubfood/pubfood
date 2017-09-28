/**
 * pubfood
 *
 * - check to make sure that the bidder's done callback was called
 */

/* global describe, it */

'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/

require('../common');
var pubfood = require('../../src/pubfood');
var assert = require('chai').assert;
var expect = require('chai').expect;
var Event = require('../../src/event');

describe('Provider done callback timeout', function() {
  var pf;
  beforeEach(function() {
    pf = new pubfood();
    Event.removeAllListeners();
  });
  afterEach(function() {
    pf = null;
    Event.removeAllListeners();
  });

  describe('get / set auction and done callback timeouts', function() {
    it('should set and return the same timeout() value set', function(done) {
      pf.timeout(1000);
      assert.equal(pf.timeout(), 1000, 'the timeout() value should be the same');
      done();
    });

    it('should set and return the same doneCallbackOffset() value set', function(done) {
      pf.doneCallbackOffset(1000);
      assert.equal(pf.doneCallbackOffset(), 1000, 'the doneCallbackOffset() value should be the same');
      done();
    });
  });

  describe('with deprecated pubfood config', function() {
    it('should use the callback timeout value from config', function(done) {
      var pf = new pubfood({
        bidProviderCbTimeout: 1
      });
      pf.timeout(1000);
      var bidProvider = pf.addBidProvider({
        name: 'bidderAvg',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        }
      });
      assert.equal(bidProvider.getTimeout(), 1, 'the default bid provider timeout should be 1');
      done();
    });

    it('should use the auction mediator default callback timeout if value from config is zero', function(done) {
      var pf = new pubfood({
        bidProviderCbTimeout: 0
      });
      pf.timeout(1000);
      var bidProvider = pf.addBidProvider({
        name: 'bidderAvg',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        }
      });
      assert.equal(bidProvider.getTimeout(), 5000, 'the default bid provider timeout should be 5000');
      done();
    });

    it('should use the auction mediator default callback timeout offset if config not supplied to pubfood ctor', function(done) {
      pf.timeout(1000);
      var bidProvider = pf.addBidProvider({
        name: 'bidderAvg',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        }
      });
      assert.equal(bidProvider.getTimeout(), 6000, 'the default bid provider timeout should be pf.timeout(1000) + 5000');
      done();
    });

    it('should use the bid provider done callback timeout if supplied to the pubfood ctor', function(done) {

      var pf = new pubfood({
        bidProviderCbTimeout: 1
      });

      pf.timeout(1);

      var mochaDone = done,
        auctionDone = false,
        bidTimeoutId,
        bidNotDone = true;

      pf.observe('AUCTION_COMPLETE', function(event) {
        if (bidNotDone) {
          mochaDone();
        }
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidderAvg'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        }
      });

      pf.addBidProvider({
        name: 'bidderAvg',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          bidTimeoutId = setTimeout(function() {
            bidNotDone = false;
            done();
          }, 2);
        }
      });

      pf.start();
    });

    it('should use auction provider done callback if supplied to the pubfood ctor', function(done) {

      var pf = new pubfood({
        auctionProviderCbTimeout: 1
      });

      pf.timeout(50);

      var mochaDone = done,
        auctionDone = false,
        auctionTimeoutId;

      pf.observe('AUCTION_COMPLETE', function(event) {
        assert.equal(auctionDone, false, 'the done callback timeout should complete the auction before flag is set');
        mochaDone();
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidderAvg'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          auctionTimeoutId = setTimeout(function() {
            auctionDone = true;
            done();
          }, 10);
        }
      });

      pf.addBidProvider(      {
        name: 'bidderAvg',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        }
      });

      pf.start();
    });
  });

  it('should use the auction mediator default callback timeout offset', function(done) {

    pf.timeout(50);

    var mochaDone = done,
      auctionTimeoutId,
      auctionDone = false;

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.equal(auctionDone, true, 'auction mediator default callback timeout offset should be used');
      mochaDone();
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        auctionTimeoutId = setTimeout(function() {
          auctionDone = true;
          done();
        }, 10);
      }
    });

    pf.addBidProvider(      {
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      }
    });

    pf.start();
  });

  it('should force complete auction processing for auction in 10ms with: bidProvider.timeout(5) and pubfood.doneCallbackOffset(1)', function(done) {

    pf.timeout(5);
    pf.doneCallbackOffset(1);
    var mochaDone = done,
      auctionTimeoutId,
      auctionDone = false;

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
      assert.equal(auctionDone, false, 'pubfood supplied done callback timeout should be used');
      mochaDone();
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        auctionTimeoutId = setTimeout(function() {
          auctionDone = true;
          done();
        }, 10);
      }
    });

    pf.addBidProvider(      {
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      }
    });

    pf.start();
  });

  it('should force complete bid processing for bid in 20ms with: bidProvider.timeout(1) and pubfood.timeout(5)', function(done) {

    pf.timeout(5);

    var mochaDone = done,
      auctionDone = false,
      bidTimeoutId,
      bidDone = false;

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.isUndefined(event.annotations.forcedDone, 'auction complete event should NOT be annotated as forcedDone');
      assert.equal(bidDone, true, 'bid timeout of 1ms should have already fired');
      mochaDone();
    }, null, this);

    pf.observe('BID_COMPLETE', function(event) {
      assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
      assert.equal(auctionDone, false, 'auction timeout of 5ms should not be fired yet');
      bidDone = true;
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        setTimeout(function() {
          done();
        }, 1);
      }
    });

    var bidderAvg = pf.addBidProvider({
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        bidTimeoutId = setTimeout(function() {
          done();
        }, 20);
      }
    });
    bidderAvg.timeout(1);

    pf.start();
  });

  it('should force complete bid processing for bid in 20ms with: bidProvider.timeout(5) and pubfood.timeout(1)', function(done) {

    pf.timeout(1);

    var mochaDone = done,
      auctionDone = false,
      bidTimeoutId,
      bidDone = false;

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.isUndefined(event.annotations.forcedDone, 'auction complete event should NOT be annotated as forcedDone');
      assert.equal(bidDone, false, 'bid timeout of 5ms should not have fired');
      auctionDone = true;
      mochaDone();
    });

    pf.observe('BID_COMPLETE', function(event) {
      assert.equal(event.annotations.forcedDone.type, 'timeout', 'bid complete event should be annotated as forcedDone');
      assert.equal(auctionDone, true, 'auction timeout of 1ms should have already fired');
      bidDone = true;
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      }
    });

    var bidderAvg = pf.addBidProvider({
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        bidTimeoutId = setTimeout(function() {
          done();
        }, 20);
      }
    });
    bidderAvg.timeout(5);

    pf.start();
  });

  it('should force complete bid(20ms) and auction(20ms) processing with: pubfood.timeout(5) + auctionProvider.timeout(1)', function(done) {

    pf.timeout(5);

    var mochaDone = done,
      auctionDone = false,
      bidDone = false,
      bidTimeoutId,
      auctionTimeoutId;

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
      assert.equal(bidDone, false, 'auctionProvider.timeout(1) should fire before bid flag set');
      assert.equal(auctionDone, false, 'auctionProvider.timeout(1) should fire before bid flag set');
      mochaDone();
    });

    pf.observe('BID_COMPLETE', function(event) {

      if (pf.getAuctionId() === event.auctionId) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
        assert.equal(bidDone, false, 'auctionProvider.timeout(1) should fire before bid flag set');
        assert.equal(auctionDone, false, 'auctionProvider.timeout(1) should fire before bid flag set');
      }
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        auctionTimeoutId = setTimeout(function() {
          auctionDone = true;
          done();
        }, 20);
      }
    });
    auctionProvider.timeout(1);

    var bidderAvg = pf.addBidProvider({
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        bidTimeoutId = setTimeout(function() {
          bidDone = true;
          done();
        }, 20);
      }
    });
    bidderAvg.timeout(1);
    pf.start();
  });

  it('should complete bid(2ms) and auction(2ms) processing with: pubfood.timeout(1) + auctionProvider.timeout(5)', function(done) {

    pf.timeout(1);

    var testState = {
      mochaDone: done,
      auctionDone: false,
      bidDone: false,
      bidTimeoutId: '',
      auctionTimeoutId: ''};

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.equal(testState.bidDone, true, 'bidderAvg.init should complete before auctionProvider.timeout(5)');
      assert.equal(testState.auctionDone, true, 'auctionProvider.init should complete before auctionProvider.timeout(5)');
      done();
    });

    pf.observe('BID_COMPLETE', function(event) {
      assert.equal(testState.bidDone, true, 'bidderAvg.init should set the bidDone flag');
      assert.equal(testState.auctionDone, false, 'auctionProvider.init should complete after after bidDone flag set');
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    var bidderAvg = pf.addBidProvider({
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        testState.bidTimeoutId = setTimeout(function() {
          testState.bidDone = true;
          done();
        }, 2);
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        testState.auctionTimeoutId = setTimeout(function() {
          testState.auctionDone = true;
          done();
        }, 2);
      }
    });
    auctionProvider.timeout(5);

    pf.start();
  });

  it('should wait for all bidder done callbacks if pf.timeout() not called: no timeout for the auction', function(done) {


    var mochaDone = done,
      auctionTimeoutId,
      auctionDone = false,
      bidTimeoutId,
      bidAvgDone = false,
      bidFastDone = false;

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.equal(auctionDone, true, 'the auction done flag should be set');
      assert.equal(bidAvgDone, true, 'bidderAvg should have set the done flag');
      assert.equal(bidFastDone, true, 'bidderFast should have set the done flag');
      mochaDone();
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidderAvg'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        auctionTimeoutId = setTimeout(function() {
          auctionDone = true;
          done();
        }, 1);
      }
    });

    pf.addBidProvider(      {
      name: 'bidderAvg',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        bidTimeoutId = setTimeout(function() {
          bidAvgDone = true;
          done();
        }, 2);
      }
    });

    pf.addBidProvider(      {
      name: 'bidderFast',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        bidFastDone = true;
        done();
      }
    });

    pf.start();
  });
});
