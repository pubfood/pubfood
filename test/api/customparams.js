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

require('../common');
var pubfood = require('../../src/pubfood');

describe('Object Custom Parameters', function() {

  var BID_DELEGATE = {
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    },
    AUCTION_DELEGATE = {
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    },
    SLOT_CONFIG = {
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    };

  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should set a BidProvider parameter', function(done) {
    var pf = new pubfood();
    var bidProvider = pf.addBidProvider(BID_DELEGATE);
    bidProvider.setParam('p1', 'v1');
    assert.isTrue(bidProvider.getParam('p1') === 'v1', 'bidProvider param value should be \"v1\"');
    assert.isTrue(bidProvider.getParamKeys().length === 1, 'number of param keys should be 1');
    done();
  });

  it('should set an AuctionProvider parameter', function(done) {
    var pf = new pubfood();
    var auctionProvider = pf.setAuctionProvider(AUCTION_DELEGATE);
    auctionProvider.setParam('p1', 'v1');
    assert.isTrue(auctionProvider.getParam('p1') === 'v1', 'auctionProvider param value should be \"v1\"');
    assert.isTrue(auctionProvider.getParamKeys().length === 1, 'number of param keys should be 1');
    done();
  });

  it('should set a Slot parameter', function(done) {
    var pf = new pubfood();
    var slot = pf.addSlot(SLOT_CONFIG);
    slot.setParam('p1', 'v1');
    assert.isTrue(slot.getParam('p1') === 'v1', 'slot param value should be \"v1\"');
    assert.isTrue(slot.getParamKeys().length === 1, 'number of param keys should be 1');
    done();
  });

  it('should pass Slot parameters to delegate functions', function(done) {
    var pf = new pubfood();
    var slot = pf.addSlot(SLOT_CONFIG);
    var P1 = 'p1', V1 = 'v1';
    slot.setParam(P1, V1);

    var auctionDelegate = util.clone(AUCTION_DELEGATE);
    auctionDelegate.init = function(targeting, pfDone) {
      var tgt = targeting[0];
      var slotName = tgt.name;
      var p1 = pf.getSlot(slotName).getParam(P1);
      assert.isTrue(p1 === V1, 'slot should have param v1');
      assert.isTrue(tgt.targeting.p1 === V1, 'targeting p1 should have param v1');
      pfDone();
    };
    var auctionProvider = pf.setAuctionProvider(auctionDelegate);

    var bidDelegate = util.clone(BID_DELEGATE);
    bidDelegate.init = function(slots, pushBid, pfDone) {
      var bp1 = pf.getBidProvider(this.name).getParam(P1);
      pushBid({
        slot: 'slot1',
        value: '1',
        sizes: [[1, 1]],
        targeting: {p1: bp1}
      });
      var sp1 = slots[0].getParam(P1);
      assert.isTrue(sp1 === V1, 'slot should have param v1');
      pfDone();
      done();
    };
    var bidProvider = pf.addBidProvider(bidDelegate);
    bidProvider.setParam(P1, V1);

    pf.start(Date.now(), function(err, errors) {
      if (err) {
        console.log(errors);
        done();
      }
    } );
  });

  it('should have BidProvider parameters available in delegate functions', function(done) {
    var pf = new pubfood();
    var bidProvider = pf.addBidProvider(BID_DELEGATE);
    bidProvider.setParam('p1', 'v1');

    var p1 = pf.getBidProvider(BID_DELEGATE.name).getParam('p1');
    assert.isTrue(p1 === 'v1', 'bid provider should have param v1');

    done();
  });

  it('should have AuctionProvider parameters available in delegate functions', function(done) {
    var pf = new pubfood();
    var auctionProvider = pf.setAuctionProvider(AUCTION_DELEGATE);
    auctionProvider.setParam('p1', 'v1');

    var p1 = pf.getAuctionProvider().getParam('p1');
    assert.isTrue(p1 === 'v1', 'auction provider should have param v1');

    done();
  });
});

