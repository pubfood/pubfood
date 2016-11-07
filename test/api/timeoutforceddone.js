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
var PubfoodError = require('../../src/errors');

require('../common');
var pubfood = require('../../src/pubfood');

describe('Provider forced done by timeout', function() {
  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should have forcedDone property in BID_COMPLETE event annotations', function(done) {
    var pf = new pubfood(),
      TEST_AUCTION_START_EVENT = false;

    pf.throwErrors(true);
    pf.timeout(3);

    pf.observe('BID_COMPLETE', function(event) {
      assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
      if (TEST_AUCTION_START_EVENT) {
        done();
      }
      TEST_AUCTION_START_EVENT = true;
    });
    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidProvider'
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

    var bidProvider = pf.addBidProvider({
      name: 'bidProvider',
      init: function(slots, pushBid, done) {
        setTimeout(function() {
          done();
        }, 3);
      },
      refresh: function(slots, pushBid, done) {
        setTimeout(function() {
          done();
        }, 33);
      }
    });
    bidProvider.timeout(1);
    pf.start();
    pf.refresh();
  });

  it('should have forcedDone property in AUCTION_COMPLETE event annotations', function(done) {
    var pf = new pubfood(),
      TEST_AUCTION_START_EVENT = false;

    pf.timeout(100);

    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
      if (TEST_AUCTION_START_EVENT) {
        done();
      }
      TEST_AUCTION_START_EVENT = true;
    });
    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidProvider'
      ]
    });

    var auctionProvider = pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: '../test/fixture/lib.js',
      init: function(targeting, done) {
        setTimeout(function() {
          done();
        }, 10);
      },
      refresh: function(targeting, done) {
        setTimeout(function() {
          done();
        }, 10);
      }
    });
    auctionProvider.timeout(1);

    var bidProvider = pf.addBidProvider({
      name: 'bidProvider',
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
