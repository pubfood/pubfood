/**
 * pubfood
 */

'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var expect = require('chai').expect;
var TransformOperator = require('../../src/assembler/transformoperator');
var Bid = require('../../src/model/bid');
var bid1 = require('../fixture/bid1');

describe('TransformOperator', function() {
  it('should be valid', function() {
    var t = TransformOperator.withDelegate(function(bids, params) {});

    assert.isNotNull(t, 'operator should not be null');
    expect(t.name).not.to.be.empty;

    t = null;
    t = TransformOperator.withDelegate({
      Xprocess: function(bids, params) {
      }});
    assert.isNull(t, 'operator should be null');
  });

  it('process should return an array of bids', function() {
    var t = TransformOperator.withDelegate(function(bids, params) {
      return bids;
    });

    var outBids = t.process(bid1.valid);
    expect(outBids).not.to.be.empty;

  });

  it('should process in sequence', function() {
    var t0 = TransformOperator.withDelegate(function(bids, params) {
      for (var i = 0; i < bids.length; i++) {
        bids[i].t0 = i;
      }
      return bids;
    });

    var t1 = TransformOperator.withDelegate(function(bids, params) {
      var bidTotal = 0;
      for (var i = 0; i < bids.length; i++) {
        bids[i].t1 = i;
        bidTotal = bidTotal + parseInt(bids[i].value) || 0;
      }
      bids[bids.length - 1].total = bidTotal;
      return bids;
    });

    var inBids = [];
    for (var k = 0; k < bid1.valid.length; k++) {
      inBids.push(Bid.fromObject(bid1.valid[k]));
    }

    var outBids = t0.process(inBids);
    outBids = t1.process(outBids);
    expect(outBids).not.to.be.empty;

    for (var i = 0; i < outBids.length; i++) {
      assert.isTrue(outBids[i].t0 === i, 'property not added by transform');
      assert.isTrue(outBids[i].t1 === i, 'property not added by transform');
    }
    assert.isTrue(outBids[outBids.length - 1].total === 4, 'bid total incorrect');
  });
});
