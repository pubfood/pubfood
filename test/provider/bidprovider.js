/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var BidProvider = require('../../src/provider/bidprovider');
var Event = require('../../src/event');
var logger = require('../../src/logger');

describe('Pubfood BidProvider', function() {

  var bidProviders = {
    valid: [
      {
        name: 'bidder1',
        libUri: '//localhost/cdn/bidder1.js',
        init: function(slots, pushBid, done) {
        },
        refresh: function(slots, pushBid, done) {
        }
      },
      {
        name: 'bidder2',
        libUri: '//localhost/cdn/bidder1.js',
        init: function(slots, pushBid, done) {
        }
      },
      {
        name: 'bidder3',
        init: function(slots, pushBid, done) {
        }
      },
      {
        name: 'bidder4',
        init: function(slots, pushBid, done) {
        },
        refresh: function(slots, pushBid, done) {
        }
      }
    ],
    invalid: [
      {
        name: 'bidder5'
      },
      {
        name: 'bidder6',
        libUri: '//localhost/cdn/bidder1.js',
        refresh: function(slots, pushBid, done) {
        }
      },
      {
        init: function(slots, pushBid, done) {
        },
        refresh: function(slots, pushBid, done) {
        }
      },
      {
        name: 'bidder7',
        refresh: function(slots, pushBid, done) {
        }
      },
      {
        libUri: '',
        refresh: function(slots, pushBid, done) {
        }
      }

    ]};

  it('should be valid', function() {
    var providers = bidProviders.valid;
    for (var i = 0; i < providers.length; i++) {
      var bp = BidProvider.withDelegate(providers[i]);
      assert.notEqual(bp, null, 'bid provider should not be null:\n' + JSON.stringify(providers[i], null, '  ') + '\n');
    }
  });

  it('should not create invalid provider', function() {

    var providers = bidProviders.invalid;
    for (var i = 0; i < providers.length; i++) {
      var ap = BidProvider.withDelegate(providers[i]);
      assert.isNull(ap, 'bid provider object should not have been created');
      var log = logger.history[logger.history.length - 1];
      assert.match(log.event.data.msg, /^Warn: invalid bidder delegate/, 'was not a validation error on delegate');
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
    assert.match(log.event.data, /^BidProvider.bidDelegate.refresh/, 'should get bidDelegate warning');

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
      keys.forEach(function(v) {
        sum += bidProvider.getParam(v);
      });
      assert.isTrue(sum === 21, 'key iteration should produce value of 21');

    });

    it('should not set parameter with undefined name', function() {
      var bidProvider = new BidProvider();
      var foo;
      bidProvider.setParam(foo, 0).
        setParam('p1', 1);
      assert.isTrue(bidProvider.getParamKeys().length === 1, 'should only have 1 key');
      assert.isTrue(bidProvider.getParamKeys()[0] === 'p1', 'should have key of \"p1\"');
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
      assert.isTrue(bidProvider.getParamKeys()[0] === '0', 'should have first key of \"0\"');
      assert.isTrue(bidProvider.getParamKeys()[1] === '1.01', 'should have second key of \"1.01\"');
      assert.isTrue(bidProvider.getParamKeys()[2] === 'p4', 'should have third key of \"p4\"');
      assert.isTrue(bidProvider.getParamKeys()[3] === '', 'should have fourth key of \"\"');
      assert.isTrue(bidProvider.getParamKeys()[4] === 'true', 'should have fifth key of \"true\"');
      assert.isTrue(bidProvider.getParam('0') === 2, 'parameter \"0\" should have value of 2');
      assert.isTrue(bidProvider.getParam('1.01') === 2.1, 'parameter \"1.01\" should have value of 2.1');
      assert.isTrue(bidProvider.getParam('p4') === 4, 'parameter \"p4\" should have value of 4');
      assert.isTrue(bidProvider.getParam('') === 4.1, 'parameter \"\" should have value of 4.1');
      assert.isTrue(bidProvider.getParam('true') === 8, 'parameter \"true\" should have value of 8');
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

  it('should have a default timeout value of zero', function() {
    var bidProvider = new BidProvider();
    assert.equal(bidProvider.getTimeout(), 0, 'bid provider done timeout should be 0');
  });

  it('should allow get and set of a timeout value', function() {
    var bidProvider = new BidProvider();
    bidProvider.timeout(500);
    assert.equal(bidProvider.getTimeout(), 500, 'bid provider done timeout should be set');
  });

  it('should set timeout to zero (0) for non-numeric argument', function() {
    var bidProvider = new BidProvider();
    bidProvider.timeout('500');
    assert.equal(bidProvider.getTimeout(), 0, 'bid provider done timeout should be 0');
    bidProvider.timeout({timeout: 500});
    assert.equal(bidProvider.getTimeout(), 0, 'bid provider done timeout should be 0');
    bidProvider.timeout([500]);
    assert.equal(bidProvider.getTimeout(), 0, 'bid provider done timeout should be 0');
    bidProvider.timeout(function() { return 500; });
    assert.equal(bidProvider.getTimeout(), 0, 'bid provider done timeout should be 0');
  });

  it('should construct a provider timeout from a withDelegate', function() {
    var bidProvider = BidProvider.withDelegate({
      name: 'bp',
      libUri: 'http://',
      init: function(slots, pushBid, done) {},
      refresh: function(slots, pushBid, done) {},
      timeout: 87
    });
    assert.equal(bidProvider.getTimeout(), 87, 'provider timeout value should have been set withDelegate');
  });
});
