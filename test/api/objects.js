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

describe('Object Creation', function() {

  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should not error adding undefined objects', function(done) {
    var pf = new pubfood();

    pf.addSlot();
    pf.addBidProvider();
    pf.setAuctionProvider();
    pf.timeout(1);

    Event.on(Event.EVENT_TYPE.WARN, function(event) {

    });
    pf.start();
    pf.refresh();

    done();
  });

  it('should not error adding ill-defined objects', function(done) {
    var pf = new pubfood();

    pf.addSlot({});
    pf.addBidProvider({});
    pf.setAuctionProvider({});
    pf.timeout(1);

    Event.on(Event.EVENT_TYPE.WARN, function(event) {

    });
    pf.start();
    pf.refresh();

    done();
  });

  it('should create a BidProvider', function(done) {

    var pf = new pubfood();
    var bidProvider = pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    assert.isDefined(bidProvider);
    assert.isDefined(bidProvider.id);

    done();
  });

  it('should create an AuctionProvider', function(done) {
    var pf = new pubfood();
    var auctionProvider = pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    assert.isDefined(auctionProvider);
    assert.isDefined(auctionProvider.id);

    done();
  });

  it('should create a Slot', function(done) {
    var pf = new pubfood();
    var slot = pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: []
    });

    assert.isDefined(slot);
    assert.isDefined(slot.id);

    done();
  });
});
