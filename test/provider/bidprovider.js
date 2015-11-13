/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var BidProvider = require('../../src/provider/bidprovider');
var bidProvider1 = require('../fixture/bidprovider1');
var Event = require('../../src/event');
var logger = require('../../src/logger');

describe('Pubfood BidProvider', function() {
  it('should should be valid', function() {
    var providers = bidProvider1.valid;
    for (var i = 0; i < providers.length; i++) {
      var bp = BidProvider.withDelegate(providers[i]);
      assert.isDefined(bp, 'bid provider should be created');
    }
  });

  it('should not create invalid provider', function() {

    var providers = bidProvider1.invalid;
    for (var i = 0; i < providers.length; i++) {
      var ap = BidProvider.withDelegate(providers[i]);
      assert.isNull(ap, 'bid provider should be created');
      var log = logger.history[logger.history.length - 1];
      assert.match(log.args[1].msg, /^Warn: invalid bidder delegate/, 'was not a validation error on delegate');
    }
  });

  it('should not reference optional refresh delegate if not defined', function() {

    var BID_PROVIDER_NO_REFRESH = {
      name: 'no-refresh',
      libUri: 'the Uri',
      init: function(slots, pushBid, done) {}
    };

    var bp = BidProvider.withDelegate(BID_PROVIDER_NO_REFRESH);
    assert.isDefined(bp.refresh);
    assert.isDefined(bp.bidDelegate);

    bp.refresh();
    var log = logger.history[logger.history.length - 1];
    assert.match(log.args[1], /^BidProvider.bidDelegate.refresh/, 'should get bidDelegate warning');

    var BID_PROVIDER_WITH_REFRESH = {
      name: 'no-refresh',
      libUri: 'the Uri',
      init: function() {},
      refresh: function() { testRefresh = true; }
    };

    var testRefresh = false;
    var bp2 = BidProvider.withDelegate(BID_PROVIDER_WITH_REFRESH);
    bp2.refresh();
    assert.isTrue(testRefresh, 'refresh delegate not called');
  });
});
