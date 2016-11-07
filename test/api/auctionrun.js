/**
 * pubfood
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

describe('Pubfood auction run api', function() {
  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should return auction count of zero if pubfood not configured', function(done) {
    var pf = new pubfood();
    pf.timeout(1);
    assert.equal(pf.getAuctionCount(), 0, 'no auction has started. index should be zero');

    pf.start();
    assert.equal(pf.getAuctionCount(), 0, 'auction started, but not configured. index should zero');

    done();
  });

  it('should return auction count greater than zero if configured and start called', function(done) {

    var pf = new pubfood(),
      isRefresh = false;
    pf.timeout(1);

    pf.observe('AUCTION_REFRESH', function(event) {
      isRefresh = true;
    });

    pf.observe('AUCTION_COMPLETE', function(event) {
      if (isRefresh) {
        assert.equal(pf.getAuctionCount(), 2, 'refresh index should be two');
        done();
      } else {
        assert.equal(pf.getAuctionCount(), 1, 'start index should be two');
      }
    });

    pf.addSlot({
      name: '/00000000/medrec',
      sizes: [
        [300, 250]
      ],
      elementId: 'div-medrec',
      bidProviders: [
        'bidderA'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    pf.addBidProvider({
      name: 'bidderA',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    pf.start();
    pf.refresh();
  });

  it('should return the auction run by index', function(done) {

    var pf = new pubfood(),
      isRefresh = false;
    pf.timeout(1);

    pf.observe('AUCTION_REFRESH', function(event) {
      isRefresh = true;
    });

    pf.observe('AUCTION_COMPLETE', function(event) {
      if (isRefresh) {
        var bidStatus = pf.getAuctionRun(2).bidStatus;
        assert.isTrue(bidStatus['bidderA'], 'bidderA should be complete with refresh auction');
        done();
      } else {
        var bidStatus = pf.getAuctionRun(1).bidStatus;
        assert.isTrue(bidStatus['bidderA'], 'bidderA should be complete with init auction');
      }
    });

    pf.addSlot({
      name: '/00000000/medrec',
      sizes: [
        [300, 250]
      ],
      elementId: 'div-medrec',
      bidProviders: [
        'bidderA'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    pf.addBidProvider({
      name: 'bidderA',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    pf.start();
    pf.refresh();
  });

  it('should return keep the auctionType', function(done) {

    var pf = new pubfood(),
      isRefresh = false;
    pf.timeout(1);


    pf.observe('AUCTION_COMPLETE', function(event) {
      var auctionIdx = pf.getAuctionCount();
      var auctionRun = pf.getAuctionRun(auctionIdx);
      if (auctionRun.auctionType === 'refresh') {
        var bidStatus = pf.getAuctionRun(auctionIdx).bidStatus;
        assert.isTrue(bidStatus['bidderA'], 'bidderA should be complete with refresh auction');
        done();
      } else {
        var bidStatus = pf.getAuctionRun(auctionIdx).bidStatus;
        assert.isTrue(bidStatus['bidderA'], 'bidderA should be complete with init auction');
      }
    });

    pf.addSlot({
      name: '/00000000/medrec',
      sizes: [
        [300, 250]
      ],
      elementId: 'div-medrec',
      bidProviders: [
        'bidderA'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    pf.addBidProvider({
      name: 'bidderA',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    pf.start();
    pf.refresh();
  });
});
