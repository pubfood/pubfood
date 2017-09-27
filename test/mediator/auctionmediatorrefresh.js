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

describe('Auction Refresh', function () {

  var TEST_MEDIATOR;
  beforeEach(function() {
    Event.removeAllListeners();

    TEST_MEDIATOR = null;
    TEST_MEDIATOR = new AuctionMediator();

    TEST_MEDIATOR.addSlot({
      name: '/abc/123',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: ['b1']
    });

    TEST_MEDIATOR.addBidProvider({
      name: 'b1',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '235',
          sizes: [728, 90],
          targeting: { call_type: 'init' }
        });
        done();
      },
      refresh: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '236',
          sizes: [728, 90],
          targeting: { call_type: 'refresh' }
        });
        done();
      }
    });

    TEST_MEDIATOR.setAuctionProvider({
      name: 'provider1',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

  });

  it('should have auction count incremented for each refresh', function(done) {
    var auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.isDefined(auctionIdx, 'auction mediator should have an counter');
    assert.equal(auctionIdx, 0, 'expected auction count to be 0');

    TEST_MEDIATOR.start();

    TEST_MEDIATOR.refresh(['/abc/123']);
    auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.equal(auctionIdx, 2, 'expected auction count to be incremented');
    assert.equal(TEST_MEDIATOR.getAuctionRunType(2), 'refresh', 'default auctionType should be \"refresh\"');
    done();
  });

  it('should keep track bids per auction', function(done) {
    TEST_MEDIATOR.setAuctionProvider({
      name: 'provider1',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    TEST_MEDIATOR.start();
    var auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.equal(auctionIdx, 1, 'should be the first auction');
    assert.equal(TEST_MEDIATOR.auctionRun[auctionIdx].bids.length, 1, 'should be one init bid');

    TEST_MEDIATOR.refresh(['/abc/123']);
    auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.equal(auctionIdx, 2, 'should be the second auction');
    assert.equal(TEST_MEDIATOR.auctionRun[auctionIdx].bids.length, 1, 'should be one refresh bid');

    done();
  });

  it('should be able to get bids by auction counter', function(done) {

    // Add another bid provider
    TEST_MEDIATOR.addBidProvider({
      name: 'b2',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '555',
          sizes: [728, 90],
          targeting: { call_type: 'init' }
        });
        done();
      },
      refresh: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '556',
          sizes: [728, 90],
          targeting: { call_type: 'refresh' }
        });
        done();
      }
    });

    // Add bidder b2 to slot
    TEST_MEDIATOR.slotMap['/abc/123'].bidProviders.push('b2');

    TEST_MEDIATOR.start();
    var auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.equal(TEST_MEDIATOR.auctionRun[auctionIdx].bids.length, 2, 'should be two init bids');

    TEST_MEDIATOR.refresh();
    assert.equal(TEST_MEDIATOR.auctionRun[auctionIdx].bids.length, 2, 'should be two refresh bids');
    done();

  });

  it('should allow optional slot names array argument to refresh', function(done) {
    TEST_MEDIATOR.setAuctionProvider({
      name: 'provider1',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    TEST_MEDIATOR.start();
    var auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.equal(TEST_MEDIATOR.auctionRun[auctionIdx].bids.length, 1, 'should be one init bid');

    TEST_MEDIATOR.refresh();
    auctionIdx = TEST_MEDIATOR.getAuctionCount();
    assert.equal(TEST_MEDIATOR.auctionRun[auctionIdx].bids.length, 1, 'should be one refresh bid');

    done();
  });

  it('should have the correct count of start and refresh auction calls', function(done) {

    var auctionTargeting = { init: [], refresh: [] };
    // Redefine the auction provider
    TEST_MEDIATOR.setAuctionProvider({
      name: 'provider1',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        auctionTargeting.init.push(targeting);
        done();
      },
      refresh: function(targeting, done) {
        auctionTargeting.refresh.push(targeting);
        done();
      }
    });

    // Add another bid provider
    TEST_MEDIATOR.addBidProvider({
      name: 'b2',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '555',
          sizes: [728, 90]
        });
        done();
      },
      refresh: function(slots, pushBid, done) {
        pushBid({
          slot: '/abc/123',
          value: '556',
          sizes: [728, 90]
        });
        done();
      }
    });

    // Add bidder b2 to slot
    TEST_MEDIATOR.slotMap['/abc/123'].bidProviders.push('b2');

    TEST_MEDIATOR.start();
    for (var i = 0; i < 10; i++) {
      TEST_MEDIATOR.refresh();
    }
    for (var i = 1; i < TEST_MEDIATOR.getAuctionCount() + 1; i++) {
      var bids = TEST_MEDIATOR.auctionRun[i].bids;
      assert.equal(bids.length, 2, 'should be two bids for each auction');
      assert.notEqual(bids[0], bids[1], 'bids should be different in each auction');
    }
    assert.equal(auctionTargeting.init.length, 1, 'should be one init auction provider call');
    assert.equal(auctionTargeting.refresh.length, 10, 'should be ten refresh auction provider calls');

    done();
  });

  it('should emit auction refresh event', function(done) {
    Event.on(Event.EVENT_TYPE.AUCTION_REFRESH, function(event) {
      assert.equal(event.data, 'provider1', 'should be the auction provider name');
      done();
    });
    TEST_MEDIATOR.start();
    TEST_MEDIATOR.refresh();
  });

  it('should get auction run data', function(done) {
    var refreshStarted = false;
    Event.on(Event.EVENT_TYPE.AUCTION_REFRESH, function(event) {
      refreshStarted = true;
    });
    Event.on(Event.EVENT_TYPE.AUCTION_COMPLETE, function(event) {
      if (refreshStarted) {
        var slotsRun2 = TEST_MEDIATOR.getAuctionRunSlots(2);
        assert.equal(slotsRun2[0].name, '/abc/123', 'should get run #2 slots');

        var bidsRun2 = TEST_MEDIATOR.getAuctionRunBids(2);
        assert.equal(bidsRun2[0].value, 236, 'should get run #2 bids');

        var lateBidsRun2 = TEST_MEDIATOR.getAuctionRunLateBids(2);
        assert.equal(lateBidsRun2.length, 0, 'should get run #2 lateBids');

        var targetingRun2 = TEST_MEDIATOR.getAuctionRunTargeting(2);
        assert.equal(targetingRun2[0].targeting.b1_bid, 236, 'should get run #2 targeting');

        done();
      }
    });
    TEST_MEDIATOR.start();
    TEST_MEDIATOR.refresh();
  });

  it('should handle async pushBid and done callbacks', function(done) {
    var timeouts = [];
    for (var t = 0; t < 50; t++) {
      timeouts.push(t);
    }
    util.randomize(timeouts);

    Event.on(Event.EVENT_TYPE.AUCTION_REFRESH, function() {
      util.randomize(timeouts);
    });

    // Add more bid providers
    TEST_MEDIATOR.addBidProvider({
      name: 'b2',
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
        }, timeouts[0]);
      },
      refresh: function(slots, pushBid, done) {
        var argPushBid = pushBid;
        setTimeout(function() {
          argPushBid({
            slot: '/abc/123',
            value: '446',
            sizes: [728, 90]
          });
          done();
        }, timeouts[1]);
      }
    });

    TEST_MEDIATOR.addBidProvider({
      name: 'b3',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        var argPushBid = pushBid;
        setTimeout(function() {
          argPushBid({
            slot: '/abc/123',
            value: '555',
            sizes: [728, 90]
          });
          done();
        }, timeouts[2]);
      },
      refresh: function(slots, pushBid, done) {
        var argPushBid = pushBid;
        setTimeout(function() {
          argPushBid({
            slot: '/abc/123',
            value: '556',
            sizes: [728, 90]
          });
          done();
        }, timeouts[3]);
      }
    });

    // Add bidder b2 and b3 to slot
    TEST_MEDIATOR.slotMap['/abc/123'].bidProviders.push('b2', 'b3');

    var auctionIdx = 1;
    Event.on(Event.EVENT_TYPE.AUCTION_COMPLETE, function(event) {
      if (auctionIdx === 2) {
        var targetingRun2 = TEST_MEDIATOR.getAuctionRunTargeting(2);
        var targetingRun1 = TEST_MEDIATOR.getAuctionRunTargeting(1);

        assert.equal(targetingRun1[0].targeting.b1_bid, 235, 'should get run #1 b1 targeting');
        assert.equal(targetingRun1[0].targeting.b2_bid, 445, 'should get run #1 b2 targeting');
        assert.equal(targetingRun1[0].targeting.b3_bid, 555, 'should get run #1 b3 targeting');

        assert.equal(targetingRun2[0].targeting.b1_bid, 236, 'should get run #2 b1 targeting');
        assert.equal(targetingRun2[0].targeting.b2_bid, 446, 'should get run #2 b2 targeting');
        assert.equal(targetingRun2[0].targeting.b3_bid, 556, 'should get run #2 b3 targeting');

        done();
      }
      ++auctionIdx;
    });
    TEST_MEDIATOR.start();
    TEST_MEDIATOR.refresh(['/abc/123', '/abc/456']);
  });

  it('should run refresh auction on a particular slot with a subset of bid providers', function(done) {
    TEST_MEDIATOR.addSlot({
      name: '/abc/456',
      sizes: [
        [300, 250]
      ],
      elementId: 'div-rectangle',
      bidProviders: ['b1', 'b2']
    });

    // Add more bid providers
    TEST_MEDIATOR.addBidProvider({
      name: 'b2',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    TEST_MEDIATOR.addBidProvider({
      name: 'b3',
      libUri: 'fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    TEST_MEDIATOR.slotMap['/abc/123'].bidProviders.push('b2', 'b3');

    var auctionIdx = 1;
    Event.on(Event.EVENT_TYPE.AUCTION_COMPLETE, function(event) {
      if (auctionIdx === 2) {
        done();
      }
      ++auctionIdx;
    });
    TEST_MEDIATOR.start();
    TEST_MEDIATOR.refresh(['/abc/456']);
  });
});
