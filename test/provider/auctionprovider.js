/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
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
      assert.isDefined(ap, 'auction provider should be created');
    }
  });

  it('should not create invalid provider', function() {

    var providers = auctionProvider1.invalid;
    for (var i = 0; i < providers.length; i++) {
      var ap = AuctionProvider.withDelegate(providers[i]);
      assert.isNull(ap, 'auction provider should be created');
      var log = logger.history[logger.history.length - 1];
      assert.match(log.args[1].msg, /^Warn: invalid auction delegate/, 'was not a validation error on delegate');
    }
  });
});

