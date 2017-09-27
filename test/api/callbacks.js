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

describe('Callbacks', function() {

  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should call all the callbacks', function(done) {

    var bidProviderDoneCalled = {
      bidderAvg: false,
      bidderFast: false,
      bidderSlow: false
    };

    var pf = new pubfood({
      id: 'optionalId',
      auctionProviderCbTimeout: 1,
      bidProviderCbTimeout: 1
    });

    var slots = [
      {
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidderAvg',
          'bidderFast',
          'bidderSlow'
        ]
      },
      {
        name: '/0000001/another-size',
        sizes: [
          [300, 250],
          [300, 450]
        ],
        elementId: 'div-another-size',
        bidProviders: [
        ]
      },
      {
        name: '/0000010/another',
        sizes: [
          [300, 250],
          [300, 450]
        ],
        elementId: 'div-another',
      }
    ];

    for (var i in slots) {
      pf.addSlot(slots[i]);
    }
    var checkDoneCallbacks = function(_key) {
      describe(_key + ' done callback called', function() {
        it('should be called', function(d) {
          assert.equal(bidProviderDoneCalled[_key], true, 'done callback was triggered for ' + _key);
          d();
        });
      });
    };

    // add reporter for PUBFOOD_API_START
    pf.observe('PUBFOOD_API_START', function(event) {
      var bidProviders = pf.getBidProviders();
      for(var key in bidProviders){
        bidProviderDoneCalled[key] = false;
      }
    });

    // add reporter for BID_COMPLETE
    pf.observe('BID_COMPLETE', function(event) {
      var data = event.data;
      if (typeof bidProviderDoneCalled[data] !== 'undefined') {
        bidProviderDoneCalled[data] = true;
      }
    });

    // add reporter for AUCTION_COMPLETE
    pf.observe('AUCTION_COMPLETE', function(event) {
      // check to make sure that the bidder's done callback was called
      for (var key in bidProviderDoneCalled) {
        checkDoneCallbacks(key);
      }

      done();
    });

    // set the auction provider
    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    });

    // add bid providers
    var bidProviders = [
      {
        name: 'bidderAvg',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        },
        refresh: function(slots, pushBid, done) {
          done();
        }
      },
      {
        name: 'bidderFast',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        },
        refresh: function(slots, pushBid, done) {
          done();
        }
      },
      {
        name: 'bidderSlow',
        libUri: 'fixture/lib.js',
        init: function(slots, pushBid, done) {
          done();
        },
        refresh: function(slots, pushBid, done) {
          done();
        }
      }
    ];

    for (var k in bidProviders) {
      pf.addBidProvider(bidProviders[k]);
    }

    var now = +(new Date());
    var testDone = done;
    pf.start(now, function(hasErrors, details) {
      if(hasErrors){
        testDone();
      }
    });
  });
});
