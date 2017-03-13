/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var AuctionProvider = require('../../src/provider/auctionprovider');
var auctionProvider1 = require('../fixture/auctionprovider1');
var Event = require('../../src/event');
var logger = require('../../src/logger');

describe('Pubfood AuctionProvider', function() {
  it('should should be valid', function() {
    var providers = auctionProvider1.valid;
    for (var i = 0; i < providers.length; i++) {
      var ap = AuctionProvider.withDelegate(providers[i]);
      assert.notEqual(ap, null, 'auction provider should be created');
    }
  });

  it('should not create invalid provider', function() {

    var providers = auctionProvider1.invalid;
    for (var i = 0; i < providers.length; i++) {
      var ap = AuctionProvider.withDelegate(providers[i]);
      assert.isNull(ap, 'auction provider should be created');
      var log = logger.history[logger.history.length - 1];
      assert.match(log.event.data.msg, /^Warn: invalid auction delegate/, 'was not a validation error on delegate');
    }
  });

  it('should not reference optional refresh delegate if not defined', function() {

    var AUCTION_PROVIDER_NO_REFRESH = {
      name: 'no-refresh',
      libUri: 'the Uri',
      init: function() {}
    };

    var ap = AuctionProvider.withDelegate(AUCTION_PROVIDER_NO_REFRESH);
    assert.isDefined(ap.refresh);
    assert.isDefined(ap.auctionDelegate);

    ap.refresh();
    var log = logger.history[logger.history.length - 1];
    assert.match(log.event.data, /^AuctionProvider.auctionDelegate.refresh/, 'should get auctionDelegate warning');

    var AUCTION_PROVIDER_WITH_REFRESH = {
      name: 'refresh',
      libUri: 'the Uri',
      init: function() {},
      refresh: function() { testRefresh = true; }
    };

    var testRefresh = false;
    var ap2 = AuctionProvider.withDelegate(AUCTION_PROVIDER_WITH_REFRESH);
    ap2.refresh();
    assert.isTrue(testRefresh, 'refresh delegate not called');
  });

  describe('Set Custom Parameters', function() {
    it('will set and get custom parameters', function() {
      var auctionProvider = new AuctionProvider();

      auctionProvider.setParam('aString', 'theString');
      assert.isTrue(auctionProvider.getParam('aString') === 'theString', 'should have parameter value: \"theString\"');

      auctionProvider.setParam('aBoolean', true);
      assert.isTrue(auctionProvider.getParam('aBoolean'), 'should have parameter value: true');

      auctionProvider.setParam('aNumber', 3.14);
      assert.isTrue(auctionProvider.getParam('aNumber') === 3.14, 'should have parameter value: 3.14');

      auctionProvider.setParam('anObject', {key: 'value'});
      assert.deepEqual(auctionProvider.getParam('anObject'), {key: 'value'}, 'should have parameter value: {key:\"value\"}');

      auctionProvider.setParam('anArray', ['value', 3.14]);
      assert.deepEqual(auctionProvider.getParam('anArray'), ['value', 3.14], 'should have parameter value: [\"value\", 3.14]');

      var aFunction = function(num) {
        return ++num;
      };
      auctionProvider.setParam('aFunction', aFunction);
      assert.isTrue(auctionProvider.getParam('aFunction').call(null, 0) === 1, 'should execute the function');
    });

    it('should allow fluent param creation', function() {
      var auctionProvider = new AuctionProvider();

      auctionProvider.setParam('p1', 0)
        .setParam('p2', 1)
        .setParam('p3', 2)
        .setParam('p4', 4)
        .setParam('p5', 6)
        .setParam('p6', 8);

      var paramsObject = auctionProvider.getParams();

      var sum = 0;
      for (var key in paramsObject) {
        sum += paramsObject[key];
      }
      assert.isTrue(sum === 21, 'key iteration should produce value of 21');

    });

    it('should not set parameter with undefined name', function() {
      var auctionProvider = new AuctionProvider();
      var foo;
      auctionProvider.setParam(foo, 0).
        setParam('p1', 1);
      assert.isTrue(auctionProvider.getParamKeys().length === 1, 'should only have 1 key');
      assert.isTrue(auctionProvider.getParamKeys()[0] === 'p1', 'should have key of \"p1\"');
      assert.isTrue(auctionProvider.getParam('p1') === 1, 'parameter \"p1\" should have value of 1');
    });

    it('should only add string, number or boolean parameter keys', function() {
      var auctionProvider = new AuctionProvider();

      auctionProvider.setParam({p1: 'p1'}, 0)
        .setParam(['p2'], 1)
        .setParam(0, 2)
        .setParam(1.01, 2.1)
        .setParam('p4', 4)
        .setParam('', 4.1)
        .setParam(function(){}, 6)
        .setParam(true, 8);

      assert.isTrue(auctionProvider.getParamKeys().length === 5, 'should only have 5 keys');
      var pCount = 0;
      for (var key in auctionProvider.getParams()) {
        pCount++;
      }
      assert.isTrue(pCount === 5, 'parameter value count should be \"5\"');

      assert.isTrue(auctionProvider.getParamKeys()[0] === '0', 'should have first key of \"0\"');
      assert.isTrue(auctionProvider.getParamKeys()[1] === '1.01', 'should have second key of \"1.01\"');
      assert.isTrue(auctionProvider.getParamKeys()[2] === 'p4', 'should have third key of \"p4\"');
      assert.isTrue(auctionProvider.getParamKeys()[3] === '', 'should have fourth key of \"\"');
      assert.isTrue(auctionProvider.getParamKeys()[4] === 'true', 'should have fifth key of \"true\"');
      assert.isTrue(auctionProvider.getParam('0') === 2, 'parameter \"0\" should have value of 2');
      assert.isTrue(auctionProvider.getParam('1.01') === 2.1, 'parameter \"1.01\" should have value of 2.1');
      assert.isTrue(auctionProvider.getParam('p4') === 4, 'parameter \"p4\" should have value of 4');
      assert.isTrue(auctionProvider.getParam('') === 4.1, 'parameter \"\" should have value of 4.1');
      assert.isTrue(auctionProvider.getParam('true') === 8, 'parameter \"true\" should have value of 8');
    });
  });

  it('should have a default timeout value of zero', function() {
    var auctionProvider = new AuctionProvider();
    assert.equal(auctionProvider.getTimeout(), 0, 'auction provider done timeout should be 0');
  });

  it('should allow get and set of a timeout value', function() {
    var auctionProvider = new AuctionProvider();
    auctionProvider.timeout(500);
    assert.equal(auctionProvider.getTimeout(), 500, 'auction provider done timeout should be set');
  });

  it('should set timeout to zero (0) for non-numeric argument', function() {
    var auctionProvider = new AuctionProvider();
    auctionProvider.timeout('500');
    assert.equal(auctionProvider.getTimeout(), 0, 'auction provider done timeout should be 0');
    auctionProvider.timeout({timeout: 500});
    assert.equal(auctionProvider.getTimeout(), 0, 'auction provider done timeout should be 0');
    auctionProvider.timeout([500]);
    assert.equal(auctionProvider.getTimeout(), 0, 'auction provider done timeout should be 0');
    auctionProvider.timeout(function() { return 500; });
    assert.equal(auctionProvider.getTimeout(), 0, 'auction provider done timeout should be 0');
  });
});
