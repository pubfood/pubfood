/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var BidAssembler = require('../../src/assembler/bidassembler');
var TransformOperator = require('../../src/assembler/transformoperator');

describe('BidAssembler', function testBidAssembler() {
  it('should add a transform operator', function() {
    var assembler = new BidAssembler();

    function transform(bids, params) {
      console.log('transform1');
      return bids;
    }
    assembler.addOperator(transform);
    assert.isTrue(transform === assembler.operators[0], 'transforms not equal');
  });

  it('should process an object property', function() {
    var assembler = new BidAssembler();

    function transform(bid, params) {
      bid.value = parseInt(bid.value) + 1;
      return bid;
    }
    assembler.addOperator(new TransformOperator(transform));
    var bids = assembler.process({value: '12'});
    assert.isTrue(bids.value === 13, 'bid value not transformed');
  });
});

