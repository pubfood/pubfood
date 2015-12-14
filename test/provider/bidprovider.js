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

  describe('Set Custom Parameters', function() {
    it('will set and get custom parameters', function() {
      var bidProvider = new BidProvider();

      bidProvider.setParam('aString', 'theString');
      assert.isTrue(bidProvider.getParam('aString') === 'theString', 'should have parameter value: \"theString\"');

      bidProvider.setParam('aBoolean', true);
      assert.isTrue(bidProvider.getParam('aBoolean'), 'should have parameter value: true');

      bidProvider.setParam('aNumber', 3.14);
      assert.isTrue(bidProvider.getParam('aNumber') === 3.14, 'should have parameter value: 3.14');

      bidProvider.setParam('anObject', {key: 'value'});
      assert.deepEqual(bidProvider.getParam('anObject'), {key: 'value'}, 'should have parameter value: {key: \"value\"}');

      bidProvider.setParam('anArray', ['value', 3.14]);
      assert.deepEqual(bidProvider.getParam('anArray'), ['value', 3.14], 'should have parameter value: [\"value\", 3.14]');

      var aFunction = function(num) {
        return ++num;
      };
      bidProvider.setParam('aFunction', aFunction);
      assert.isTrue(bidProvider.getParam('aFunction').call(null, 0) === 1, 'should execute the function');
    });

    it('should allow fluent param creation', function() {
      var bidProvider = new BidProvider();

      bidProvider.setParam('p1', 0)
        .setParam('p2', 1)
        .setParam('p3', 2)
        .setParam('p4', 4)
        .setParam('p5', 6)
        .setParam('p6', 8);

      var keys = bidProvider.getParamKeys();

      var sum = 0;
      keys.map(function(v) {
        sum += v;
      });
      assert.isTrue(sum === 21, 'key iteration should produce value of 21');

    });

    it('should not set parameter with undefined name', function() {
      var bidProvider = new BidProvider();
      var foo;
      bidProvider.setParam(foo, 0).
        setParam('p1', 1);
      assert.isTrue(bidProvider.getParamKeys().length === 1, 'should only have 1 key');
      assert.isTrue(bidProvider.getParam('p1') === 1, 'parameter \"p1\" should have value of 1');
    });

    it('should only add string, number or boolean parameter keys', function() {
      var bidProvider = new BidProvider();

      bidProvider.setParam({p1: 'p1'}, 0)
        .setParam(['p2'], 1)
        .setParam(0, 2)
        .setParam(1.01, 2.1)
        .setParam('p4', 4)
        .setParam('', 4.1)
        .setParam(function(){}, 6)
        .setParam(true, 8);

      assert.isTrue(bidProvider.getParamKeys().length === 5, 'should only have 5 keys');
    });
  });

  it('should have a default enabled status of true', function() {
    var bidProvider = new BidProvider();
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled by default');
  });

  it('should set enabled to false', function() {
    var bidProvider = new BidProvider();
    bidProvider.enabled(false);
    assert.isFalse(bidProvider.enabled(), 'bid provider should be disabled');
  });

  it('should set enabled to true', function() {
    var bidProvider = new BidProvider();
    bidProvider.enabled(false);
    assert.isFalse(bidProvider.enabled(), 'bid provider should be disabled');
    bidProvider.enabled(true);
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');
  });

  it('should only accept a boolean argument for enabled status', function() {
    var bidProvider = new BidProvider();
    bidProvider.enabled(0);
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');

    bidProvider.enabled(null);
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');

    bidProvider.enabled({});
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');

    bidProvider.enabled([]);
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');

    var foo;
    bidProvider.enabled(foo);
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');

    bidProvider.enabled(function() {});
    assert.isTrue(bidProvider.enabled(), 'bid provider should be enabled');
  });
});
