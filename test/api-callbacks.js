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

describe('Api Callbacks - Tests', function() {
  it('should call all the callbacks', function(done) {

    //
    var bidProviderDoneCalled = {
      //yieldbot: false,
      //bidderFast: false,
      //bidderSlow: false
    };

    var pf = new pubfood({
      id: 'optionalId',
      auctionProviderCbTimeout: 500,
      bidProviderCbTimeout: 600
    });

    var checkDoneCallbacks = function(_key) {
      describe(_key + ' done callback called', function() {
        it('should be called', function(d) {
          assert(bidProviderDoneCalled[_key], 'done callback was triggered for ' + _key);
          d();
        });
      });
    };

    // add reporter for PUBFOOD_API_START
    pf.addReporter('PUBFOOD_API_START', function(event) {
      var bidProviders = pf.getBidProviders();
      for(var key in bidProviders){
        bidProviderDoneCalled[key] = false;
      }
    });

    // add reporter for BID_COMPLETE
    pf.addReporter('BID_COMPLETE', function(event) {
      var data = event.data;
      if (typeof bidProviderDoneCalled[data] !== 'undefined') {
        bidProviderDoneCalled[data] = true;
      }
    });

    // add reporter for AUCTION_COMPLETE
    pf.addReporter('AUCTION_COMPLETE', function(event) {
      // check to make sure that the bidder's done callback was called
      for (var key in bidProviderDoneCalled) {
        checkDoneCallbacks(key);
      }

      done();
    });

    // add slot
    pf.addSlot(auctionExample.slots[0]);

    // set the auction provider
    pf.setAuctionProvider(auctionExample.auctionProvider);

    // add bid providers
    pf.addBidProvider(auctionExample.bidProviders[0]);
    pf.addBidProvider(auctionExample.bidProviders[1]);
    pf.addBidProvider(auctionExample.bidProviders[2]);

    var now = +(new Date());
    pf.start(now, function(hasErrors, details) {
      if(hasErrors){
        console.log('hasErrors', hasErrors, details);
        done();
      }
    });
  });
});
