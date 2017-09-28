/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Event = require('../../src/event');
var logger = require('../../src/logger');
var util = require('../../src/util');
var Bid = require('../../src/model/bid.js');

require('../common');
var pubfood = require('../../src/pubfood');

describe('Transform operator', function() {
  var pf;
  beforeEach(function() {
    pf = new pubfood();
    Event.removeAllListeners();
  });
  afterEach(function() {
    pf = null;
    Event.removeAllListeners();
  });

  it('should add bid data', function(done) {
    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, pfDone) {
        var BID_OBJECT = {
          slot: 'slot1',
          value: 'goobleplex',
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(BID_OBJECT);

        pfDone();
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        assert.equal(targeting[0].bids.length, 1, 'there shoud be one bid processed');
        for (var i in targeting) {
          var tgtObject = targeting[i];
          assert.equal(tgtObject.targeting.siteSection, 'food', 'should have bid targeting key \"siteSection\"');
        }
        pfDone();
        done();
      }
    });

    var metaTag = { siteSection: 'food' };
    pf.addBidTransform(function(bids, params) {
      for (var index = 0; index < bids.length; index++) {
        var bid = bids[index];
        bid.targeting.siteSection = metaTag.siteSection;
      }
      return bids;
    });
    pf.start();
  });

  it('should modify bid data', function(done) {

    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, pfDone) {
        var BID_OBJECT = {
          slot: 'slot1',
          value: 'goobleplex',
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(BID_OBJECT);

        pfDone();
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        assert.equal(targeting[0].bids.length, 1, 'there shoud be one bid processed');
        for (var i in targeting) {
          var tgtObject = targeting[i];
          assert.equal(tgtObject.targeting.bp1_price, 400, 'should have bid targeting key should have the modified bid targeting');
        }
        pfDone();
        done();
      }
    });

    var metaTag = { siteSection: 'food' };
    pf.addBidTransform(function(bids, params) {
      for (var index = 0; index < bids.length; index++) {
        var bid = bids[index];
        bid.value = 400;
      }
      return bids;
    });
    pf.start();
  });

  it('should remove a bid object', function(done) {
    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var slot = pf.addSlot({
      name: 'slot2',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, pfDone) {
        var BID_OBJECT_TO_REMOVE = {
          slot: 'slot1',
          value: 'goobleplex',
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(BID_OBJECT_TO_REMOVE);

        var BID_OBJECT_TO_KEEP = {
          slot: 'slot2',
          value: 250,
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(BID_OBJECT_TO_KEEP);

        pfDone();
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        var isSlot2Tested = false;
        for (var k = 0; k < targeting.length; k++) {
          var tgtObject = targeting[k];
          if (tgtObject.name === 'slot2') {
            assert.equal(tgtObject.bids.length, 1, 'slot2 should have one bid');
            assert.equal(tgtObject.name, 'slot2', 'slot2 should be the only bid');
            assert.equal(tgtObject.bids[0].value, 250, 'slot2 bid should be 250');
            assert.equal(tgtObject.targeting.bp1_price, 250, 'slot2 targeting bp1_price should be 250');
            isSlot2Tested = true;
          }
        }
        assert.equal(isSlot2Tested, true, 'slot2 was not tested');
        pfDone();
        done();
      }
    });

    pf.addBidTransform(function(bids, params) {
      var removedBids;
      for (var i = bids.length - 1; i >= 0; i--) {
        if (bids[i].value === 'goobleplex') {
          removedBids = bids.splice(i, 1);
        }
      }
      return bids;
    });
    pf.start();
  });

  it('should add a bid object', function(done) {
    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var slot = pf.addSlot({
      name: 'slot2',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, pfDone) {
        pfDone();
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        var isSlot2Tested = false;
        for (var k = 0; k < targeting.length; k++) {
          var tgtObject = targeting[k];
          if (tgtObject.name === 'slot2') {
            assert.equal(tgtObject.bids.length, 1, 'slot2 should have one bid');
            assert.equal(tgtObject.name, 'slot2', 'slot2 should be the only bid');
            assert.equal(tgtObject.bids[0].value, 250, 'slot2 bid should be 250');
            assert.equal(tgtObject.targeting.bp1_price, 250, 'slot2 targeting bp1_price should be 250');
            isSlot2Tested = true;
          }
        }
        assert.equal(isSlot2Tested, true, 'slot2 was not tested');
        pfDone();
        done();
      }
    });

    pf.addBidTransform(function(bids, params) {
      var BID_OBJECT_TO_ADD = Bid.fromObject({
        slot: 'slot2',
        value: 250,
        sizes: [[728, 90]],
        label: 'price',
        provider: 'bp1'
      });
      bids.push(BID_OBJECT_TO_ADD);
      return bids;
    });
    pf.start();
  });

  it('should use the returned bid array to add or remove a bid', function(done) {
    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var slot = pf.addSlot({
      name: 'slot2',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1']
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, pfDone) {
        var BID_OBJECT_TO_REMOVE = {
          slot: 'slot1',
          value: 'goobleplex',
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(BID_OBJECT_TO_REMOVE);

        var BID_OBJECT_TO_KEEP = {
          slot: 'slot2',
          value: 250,
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(BID_OBJECT_TO_KEEP);
        pfDone();
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        var isSlot2Tested = false;
        for (var k = 0; k < targeting.length; k++) {
          var tgtObject = targeting[k];
          if (tgtObject.name === 'slot2') {
            assert.equal(tgtObject.bids[0].value, 250, 'slot2 first bid incorrect');
            assert.equal(tgtObject.targeting.bp1_price, 250, 'slot2 targeting bp1_price incorrect');
            assert.equal(tgtObject.bids[1].value, 33, 'slot2 second bid incorrect');
            assert.equal(tgtObject.targeting.house_price, 33, 'slot2 targeting house_price incorrect');
            isSlot2Tested = true;
          }
        }
        assert.equal(isSlot2Tested, true, 'slot2 was not tested');
        pfDone();
        done();
      }
    });

    pf.addBidTransform(function(bids, params) {
      var BID_OBJECT_TO_ADD = Bid.fromObject({
        slot: 'slot2',
        value: 33,
        sizes: [[728, 90]],
        label: 'price',
        provider: 'house'
      });
      var removedBids;
      for (var i = bids.length - 1; i >= 0; i--) {
        if (bids[i].value === 'goobleplex') {
          removedBids = bids.splice(i, 1);
        }
      }
      return [bids[0], BID_OBJECT_TO_ADD];
    });
    pf.start();
  });

  it('should only be called once on getting bids within timeout', function(done) {
    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[728, 90]],
      bidProviders: ['bp1', 'bp2']
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, pfDone) {
        var bid = {
          slot: 'slot1',
          value: 'goobleplex',
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(bid);

        pfDone();
      }
    });

    bidProvider = pf.addBidProvider({
      name: 'bp2',
      init: function(slots, pushBid, pfDone) {
        var bid = {
          slot: 'slot1',
          value: 'goobleplex',
          sizes: [[728, 90]],
          label: 'price'
        };
        pushBid(bid);

        pfDone();
      }
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        pfDone();
      }
    });

    var transformCallCount = 0;
    pf.addBidTransform(function(bids, params) {
      transformCallCount += 1;
      return [bids[0]];
    });
    pf.timeout(30);

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.equal(transformCallCount, 1, 'delegate should be called only once');
      done();
    });

    pf.start();
  });

  it('should only be called once on timeout', function(done) {

    pf.throwErrors(true);
    pf.doneCallbackOffset(1);
    pf.timeout(3);

    pf.addSlot({
      name: 'slot1',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bp1'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, done) {
        setTimeout(function() {
          done();
        }, 4);
      },
      refresh: function(slots, pushBid, done) {
        setTimeout(function() {
          done();
        }, 4);
      }
    });
    bidProvider.timeout(30);
    var transformCallCount = 0;
    pf.addBidTransform(function(bids, params) {
      transformCallCount += 1;
      return bids;
    });

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.equal(transformCallCount, 1, 'delegate should be called only once');
      done();
    });

    pf.start();
  });

  it('should be called only once each for timeout of init and refresh', function(done) {

    pf.throwErrors(true);
    pf.timeout(5);

    pf.addSlot({
      name: 'slot1',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bp1'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    var transformCallCount = 0;
    var hasRefreshed = false;
    pf.addBidTransform(function(bids, params) {
      transformCallCount += 1;
      return bids;
    });

    pf.observe('AUCTION_REFRESH', function(event) {
      hasRefreshed = true;
    });

    pf.observe('AUCTION_COMPLETE', function(event) {
      if (transformCallCount === 3) {
        done();
      }
    });

    pf.start();
    pf.refresh();
    pf.refresh();
  });

});
