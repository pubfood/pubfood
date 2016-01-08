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

describe('Pubfood Events', function() {
  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should log a start event', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });
    pf.observe('PUBFOOD_API_START', function(event) {
      done();
    });
    pf.start();
  });

  it('should log an optional startTimestamp', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    var startTimestamp = Date.now();
    pf.observe('PUBFOOD_API_START', function(event) {
      assert.equal(event.ts, startTimestamp, 'should have the start timestamp supplied');
      done();
    });
    pf.start(startTimestamp);
  });

  it('should log a refresh event', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });
    pf.observe('PUBFOOD_API_REFRESH', function(event) {
      done();
    });
    pf.refresh();
  });
});
