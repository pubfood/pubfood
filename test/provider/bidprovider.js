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
});
