/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * - check to make sure that the bidder's done callback was called
 * - check for core api method calls
 */

/* global describe, it */

'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/

// set up some dom stuff
// @todo think about using `node-jsdom` for this
var fakeDom = {
  appendChild: function() {
    return {};
  },
  createElement: function() {
    return {};
  },
};

global.window = {};
global.googletag = {};
global.document = fakeDom;
global.document.head = fakeDom;
global.document.body = fakeDom;
global.document.documentElement = fakeDom;

var assert = require('chai').assert;
var expect = require('chai').expect;
var pubfood = require('../src/pubfood');
var auctionConfig = require('./fixture/auctionconfig1');
var auctionExample = require('./fixture/auctionexample1');

//
var bidProviderDoneCalled = {
  yieldbot: false,
  bidderFast: false,
  bidderSlow: false
};

var requiredApiCalls = {
  addReporter: 0,
  addSlot: 0,
  setAuctionProvider: 0,
  addBidProvider: 0,
};


describe('Api Callbacks - Tests', function() {
  it('should call all the callbacks', function(done) {

    var p = new pubfood({
      id: 'optionalId',
      auctionProviderTimeout: 2000,
      bidProviderTimeout: 2000
    });

    // add custom reporters
    p.addReporter(function(event) {
      //console.log('e', event.type);
    });

    p.addReporter('BID_PUSH_NEXT', function(event) {
      //console.log('e', event);
    });

    p.addReporter('BID_COMPLETE', function(event) {
      var provider = event.data;
      if (typeof bidProviderDoneCalled[provider] !== 'undefined') {
        bidProviderDoneCalled[provider] = true;
      }
    });

    p.addReporter('_AUCTION_COMPLETE', function(event) {
    });

    p.addReporter('AUCTION_COMPLETE', function(event) {

      p.library.logger.history.forEach(function(log) {
        if (log.functionName) {
          var fn = log.functionName.replace('api.', '');
          if (typeof requiredApiCalls[fn] !== 'undefined') {
            requiredApiCalls[fn]++;
          }
        }

      });

      var checkApiCalls = function(_api) {
        describe('api method ' + _api, function() {
          it('should be called', function(d) {
            expect(requiredApiCalls[_api]).to.be.at.least(1, _api + ' was called');
            d();
          });
        });
      };

      var checkDoneCallbacks = function(_key) {
        describe(_key + ' done callback called', function() {
          it('should be called', function(d) {
            assert(bidProviderDoneCalled[_key], 'done callback was triggered for ' + _key);
            d();
          });
        });
      };

      // check for core api method calls
      for (var api in requiredApiCalls) {
        checkApiCalls(api);
      }

      // check to make sure that the bidder's done callback was called
      for (var key in bidProviderDoneCalled) {
        checkDoneCallbacks(key);
      }

      done();
    });

    //p.addBidTransform(function(bids) {
    //
    //});
    //
    //p.addRequestTransform(function(slots) {
    //});

    // add slot
    p.addSlot(auctionExample.slots[0]);

    // set the auction provider
    p.setAuctionProvider(auctionExample.auctionProvider);

    // add bid providers
    p.addBidProvider(auctionExample.bidProviders[0]);
    p.addBidProvider(auctionExample.bidProviders[1]);
    p.addBidProvider(auctionExample.bidProviders[2]);

    // proposed callback for start method
    var now = +(new Date());
    p.start(now, function(status, details) {
      // if status === true, we're ok
      // if status === false, check `details` for errors, warnings
    });
  });
});
