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

describe('Build slot and page bids', function() {

  var SLOT, AUCTION_PROVIDER, BID_PROVIDER;

  function cloneBidProvider(idx) {
    var bp = util.clone(BID_PROVIDER);
    bp.name = 'bp' + idx;
    return bp;
  }

  beforeEach(function(done) {
    SLOT = {
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: []
    };

    AUCTION_PROVIDER = {
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, pfDone) {
        assert.equal(targeting.length, 2, 'AUCTION_PROVIDER_TMPL: should have slot AND page level targeting');

        for (var i in targeting) {
          var tgtObject = targeting[i];
          if (!tgtObject.name) {
            assert.equal(targeting[1].targeting.will_bid, 'y', 'AUCTION_PROVIDER_TMPL:should have bid targeting key \"will_bid\"');
          }
        }
        pfDone();

        done();
      },
      refresh: function(targeting, pfDone) {
        pfDone();
      }
    };

    BID_PROVIDER = {
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, pfDone) {

        var BID_OBJECT = {
          value: 'goobleplex',
          sizes: [[728, 90], [300, 250]],
          targeting: {
            will_bid: 'y',
            bid_slot: 'any'
          },
          label: 'price'
        };
        pushBid(BID_OBJECT);

        pfDone();
      },
      refresh: function(slots, pushBid, pfDone) {
        pfDone();
      }
    };

    done();
  });

  it('should push a slot-level bid alone', function(done) {
    var pf = new pubfood();
    var slot = pf.addSlot(SLOT);
    var bidProvider = pf.addBidProvider(BID_PROVIDER);
    var auctionProvider = pf.setAuctionProvider(AUCTION_PROVIDER);
    bidProvider.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        slot: 'slot1',
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);

      pfDone();
    };
    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 1, 'should have just slot level targeting');

      for (var i in targeting) {
        var tgtObject = targeting[i];
        assert.equal(tgtObject.name, 'slot1', 'should have targeting object name \"slot1\"');
        assert.equal(tgtObject.targeting.will_bid, 'y', 'should have bid targeting key \"will_bid\"');
      }
      pfDone();

      done();
    };

    pf.start();
  });

  it('should push a page-level bid alone', function(done) {
    var pf = new pubfood();
    var bidProvider = pf.addBidProvider(BID_PROVIDER);
    var auctionProvider = pf.setAuctionProvider(AUCTION_PROVIDER);
    bidProvider.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        }
      };
      pushBid(BID_OBJECT);
      pfDone();
    };
    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 1, 'should have page level targeting only when slot not added');

      for (var i in targeting) {
        var tgtObject = targeting[i];
        assert.isUndefined(tgtObject.name, 'should not have \"name\" defined');
        assert.equal(tgtObject.targeting.will_bid, 'y', 'should have bid targeting key \"will_bid\"');
      }
      pfDone();

      done();
    };
    assert.equal(pf.getSlots().length, 0, 'page-level only test should not have slots defined');
    pf.start();
  });

  it('should push a slot-level bid and a page-level bid', function(done) {
    var pf = new pubfood();
    var slot = pf.addSlot(SLOT);
    var bidProvider = pf.addBidProvider(BID_PROVIDER);
    var auctionProvider = pf.setAuctionProvider(AUCTION_PROVIDER);
    bidProvider.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };
    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 2, 'should have slot AND page level targeting when both added');

      for (var i in targeting) {
        var tgtObject = targeting[i];
        if (!tgtObject.name) {
          assert.equal(targeting[1].targeting.bid_slot, 'any', 'should have bid targeting key \"bid_slot\"');
          assert.equal(targeting[1].targeting.will_bid, 'y', 'should have bid targeting key \"will_bid\"');
          assert.equal(targeting[1].targeting.bp1_price, 'goobleplex', 'should have <provider>_<label> targeting key \"b1_price\"');
        }
      }
      pfDone();

      done();
    };
    pf.start();
  });

  it('should push a zero slot-level bid and a zero page-level bid', function(done) {
    var pf = new pubfood();
    var slot = pf.addSlot(SLOT);
    var bidProvider = pf.addBidProvider(BID_PROVIDER);
    var auctionProvider = pf.setAuctionProvider(AUCTION_PROVIDER);
    bidProvider.init = function(slots, pushBid, pfDone) {
      var SLOT_BID_OBJECT = {
        slot: 'slot1',
        value: 0,
        sizes: [[300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'slot_price'
      };
      pushBid(SLOT_BID_OBJECT);
      var PAGE_BID_OBJECT = {
        value: 0,
        sizes: [[300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'page_price'
      };
      pushBid(PAGE_BID_OBJECT);
      pfDone();
    };
    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 2, 'should have slot AND page level targeting when both added');
      assert.equal(targeting[0].targeting.bp1_slot_price, 0, 'should have slot bid targeting key value of zero');
      assert.equal(targeting[1].targeting.bp1_page_price, 0, 'should have pabe bid targeting key value of zero');
      pfDone();
      done();
    };
    pf.start();
  });

  it('should not prefix bid default key with bid provider name', function(done) {
    var pf = new pubfood();

    pf.prefixDefaultBidKey(false);

    var slot = pf.addSlot(SLOT);
    var bidProvider = pf.addBidProvider(BID_PROVIDER);
    var auctionProvider = pf.setAuctionProvider(AUCTION_PROVIDER);
    bidProvider.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y'
        },
        label: 'noBidProviderNamePrefix'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };
    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 2, 'should have slot AND page level targeting when both added');

      for (var i in targeting) {
        var tgtObject = targeting[i];
        if (!tgtObject.name) {
          assert.equal(targeting[1].targeting.will_bid, 'y', 'should have bid targeting key \"will_bid\"');
          assert.equal(targeting[1].targeting.noBidProviderNamePrefix, 'goobleplex', 'should have <label> targeting key without the bid provider name prefix');
        }
      }
      pfDone();

      done();
    };
    pf.start();
  });

  it('should omit bid default key from ad server targeting', function(done) {
    var pf = new pubfood();

    pf.omitDefaultBidKey(true);

    var slot = pf.addSlot(SLOT);
    var bidProvider = pf.addBidProvider(BID_PROVIDER);
    var auctionProvider = pf.setAuctionProvider(AUCTION_PROVIDER);
    bidProvider.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };
    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 2, 'should have slot AND page level targeting when both added');

      for (var i in targeting) {
        var tgtObject = targeting[i];
        if (!tgtObject.name) {
          assert.equal(targeting[1].targeting.will_bid, 'y', 'should have bid targeting key \"will_bid\"');
          assert.isUndefined(targeting[1].targeting.bp1_price, 'should not have default targeting key \"b1_price\"');
        }
      }
      pfDone();

      done();
    };
    pf.start();
  });

  it('should push multiple slot-level and page-level bids', function(done) {
    var pf = new pubfood();
    var slotConfig = util.clone(SLOT);
    slotConfig.bidProviders = ['bp1', 'bp2'];
    var slot = pf.addSlot(slotConfig);

    var bidProvider1 = pf.addBidProvider(cloneBidProvider(1));
    var bidProvider2 = pf.addBidProvider(cloneBidProvider(2));
    var bidProvider3 = pf.addBidProvider(cloneBidProvider(3));
    var bidProvider4 = pf.addBidProvider(cloneBidProvider(4));
    var auctionProvider = pf.setAuctionProvider(util.clone(AUCTION_PROVIDER));

    bidProvider1.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        slot: 'slot1', // slot-level bid
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };

    bidProvider2.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = {
        slot: 'slot1', // slot-level bid
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };

    bidProvider3.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = { // page-level bid
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };

    bidProvider4.init = function(slots, pushBid, pfDone) {
      var BID_OBJECT = { // page-level bid
        value: 'goobleplex',
        sizes: [[728, 90], [300, 250]],
        targeting: {
          will_bid: 'y',
          bid_slot: 'any'
        },
        label: 'price'
      };
      pushBid(BID_OBJECT);
      pfDone();
    };

    auctionProvider.init = function(targeting, pfDone) {
      assert.equal(targeting.length, 2, 'should have slot AND page level targeting');
      for (var i in targeting) {
        var tgtObject = targeting[i];

        if (!tgtObject.name) {
          assert.equal(tgtObject.bids.length, 2, 'should be 2 page level bids');

          for (var j in tgtObject.bids) {
            var provider = tgtObject.bids[j].provider;
            assert.isTrue(provider === 'bp3' || provider === 'bp4', 'should be provider 3 or 4');
          }
        } else {
          assert.equal(tgtObject.bids.length, 2, 'should be 2 slot level bids');

          for (var k in tgtObject.bids) {
            var provider = tgtObject.bids[k].provider;
            assert.isTrue(provider === 'bp1' || provider === 'bp2', 'should be provider 1 or 2');
          }
        }
      }
      pfDone();

      done();
    };
    pf.start();
  });
});
