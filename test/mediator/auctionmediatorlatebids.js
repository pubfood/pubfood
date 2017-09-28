/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
require('../common');
var assert = require('chai').assert;
var AuctionMediator = require('../../src/mediator/auctionmediator');
var Event = require('../../src/event');
var util = require('../../src/util');

describe('Late bids', function () {

  var TEST_MEDIATOR;
  beforeEach(function() {
    Event.removeAllListeners();

    TEST_MEDIATOR = null;
    TEST_MEDIATOR = new AuctionMediator();
    TEST_MEDIATOR.throwErrors(true);
    TEST_MEDIATOR.addSlot();
  });

  it('should keep bids after auction timeout i.e. late bids', function(done) {

    var m = TEST_MEDIATOR;

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        var argPushBid = pushBid;
        setTimeout(function() {
          argPushBid({
            slot: '/abc/123',
            value: '445',
            sizes: [728, 90]
          });
          done();
        }, 5);
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.7',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.once(Event.EVENT_TYPE.BID_COMPLETE, function() {
      var lateBids = m.getAuctionRunLateBids(1);
      assert.equal(lateBids.length, 1, 'should be one late bid');
      var lateBid = lateBids[0];
      assert.equal(lateBid.value, 445, 'should be a bid for 445');

      done();
    });
    m.timeout(1);
    m.start();
  });

  it('should emit a BID_PUSH_NEXT_LATE event', function(done) {

    var m = TEST_MEDIATOR;

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        var argPushBid = pushBid;
        setTimeout(function() {
          argPushBid({
            slot: '/abc/123',
            value: '445',
            sizes: [728, 90]
          });
          done();
        }, 5);
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.6',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.once(Event.EVENT_TYPE.BID_PUSH_NEXT_LATE, function() {
      var lateBids = m.getAuctionRunLateBids(1);
      assert.equal(lateBids.length, 1, 'should be one late bid');
      var lateBid = lateBids[0];
      assert.equal(lateBid.value, 445, 'should be a bid for 445');

      done();
    });
    m.timeout(1);
    m.start();
  });

  it('should keep timely bids separate from late bids', function(done) {

    var m = TEST_MEDIATOR;

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1', 'b2']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        var argPushBid = pushBid;
        setTimeout(function() { // should be late bid
          argPushBid({
            slot: '/abc/123',
            value: '445',
            sizes: [728, 90]
          });
          done();
        }, 5);
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.addBidProvider({
      name: 'b2',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({              // should be timely bid
          slot: '/abc/123',
          value: '555',
          sizes: [728, 90]
        });
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.5',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    var b2Complete = false;
    Event.on(Event.EVENT_TYPE.BID_COMPLETE, function(event) {
      if (event.data === 'b1') {
        var lateBids = m.getAuctionRunLateBids(1);
        assert.equal(lateBids.length, 1, 'should be one late bid');

        var lateBid = lateBids[0];
        assert.equal(lateBid.value, 445, 'should be a late bid for 445');

        if (b2Complete) {
          done();
        }
      }
      if (event.data === 'b2') {
        b2Complete = true;
        var bids = m.getAuctionRunBids(1);
        assert.equal(bids.length, 1, 'should be one timely bid');

        var bid = bids[0];
        assert.equal(bid.value, 555, 'should be a timely bid for 555');
      }
    });
    m.timeout(1);
    m.start();
  });

  it('should annotate bid provider with forcedDone', function(done) {

    var m = TEST_MEDIATOR;
    m.doneCallbackOffset(0);
    m.timeout(1);

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        setTimeout(function() {
          done();
        }, 5);
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.4',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.once(Event.EVENT_TYPE.BID_COMPLETE, function(event) {
      assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
      done();
    });

    m.start();
  });

  it('if timely, should NOT annotate bid provider with forcedDone', function(done) {

    var m = TEST_MEDIATOR;
    m.doneCallbackOffset(0);
    m.timeout(5);

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.3',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        setTimeout(function() {
          done();
        }, 5);
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.once(Event.EVENT_TYPE.BID_COMPLETE, function(event) {
      assert.isUndefined(event.annotations.forcedDone);
      done();
    });

    m.start();
  });

  it('should annotate auction provider with forcedDone', function(done) {
    var m = TEST_MEDIATOR;
    m.doneCallbackOffset(0);
    m.timeout(1);

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.2',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        setTimeout(function() {
          done();
        }, 5);
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.once(Event.EVENT_TYPE.AUCTION_COMPLETE, function(event) {
      if (event.annotations.auctionType.type === Event.ANNOTATION_TYPE.AUCTION_TYPE.INIT) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.TIMEOUT);
        done();
      }
    });

    m.start();
  });

  it('if timely, should NOT annotate auction provider with forcedDone', function(done) {
    var m = TEST_MEDIATOR;
    m.doneCallbackOffset(0);
    m.timeout(5);

    m.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    m.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    m.setAuctionProvider({
      name: 'provider1.1',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    Event.once(Event.EVENT_TYPE.AUCTION_COMPLETE, function(event) {
      assert.isUndefined(event.annotations.forcedDone, 'auction provider should NOT have been forced done');
      done();
    });

    m.start();
  });
});
