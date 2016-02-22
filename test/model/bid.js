/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Bid = require('../../src/model/bid.js');
var util = require('../../src/util');

describe('Bid', function testBidBuilder() {

  var bidModel = {
    value: 3.75,
    type: 'number',
    slot: 'right-rail',
    dimensions: [ [300, 250], [300, 600] ],
    provider: 'foobar'
  };

  it('should have an internal Id', function() {
    var bid = new Bid();
    assert.isDefined(bid.id, 'id is not defined');
    assert.match(bid.id, /[\w]+$/, 'id is not an ascii string');
  });

  it('should be created from object', function() {
    var bids = [
      {
        sizes: [300, 250],
        slot: '1',
        value: 1
      },
      {
        targeting: {
        },
        sizes: [300, 250],
        slot: '/this/is/a/slot',
        value: '1'
      },
      {
        targeting: {
          yes: 'yes',
        },
        sizes: [[300, 600], [300, 250]],
        slot: '/this/is/a/slot',
        value: 1
      },
      {
        targeting: {
          no: 'no'
        },
        sizes: [[728, 90]],
        slot: '/this/is/a/slot',
        value: .2
      },
      {
        targeting: {
          yes: 'yes'
        },
        sizes: [300, 250],
        slot: '/this/is/a/slot',
        value: '1.75'
      }
    ];
    for (var i = 0; i < bids.length; i++) {
      var bid = Bid.fromObject(bids[i]);
      assert.isDefined(bid, 'bid is not defined');
      assert.isDefined(bid.id, 'id is not defined');
      assert.match(bid.id, /[\w]+$/, 'id is not an ascii string');
    }
  });

  it('with a value and type', function() {

    var bidValues = [
      { v: 3, t: 'number' },
      { v: 1.76, t: 'number'},
      { v: 'xyz123', t: 'string'},
      { v: '1.76', t: 'string'}
    ];

    for (var i = 0; i < bidValues.length; i++) {

      var value = bidValues[i].v,
        type = bidValues[i].t,
        bid = new Bid(value);

      assert.equal(bid.value, value, 'bid value incorrect');
      assert.isDefined(bid.type, 'bid type undefined');
      assert.equal(bid.type, type, 'bid type incorrect');
    }
  });

  it('with a provider, slot name, dimensions and bid value', function() {
    var bid = new Bid(bidModel.value);
    bid.provider = bidModel.provider;

    var dimensions = bidModel.dimensions;
    for (var i in dimensions) {
      var size = dimensions[i];
      bid.addSize(size[0], size[1]);
    }
    assert.equal(bid.value, bidModel.value, 'bid value incorrect');
    assert.equal(bid.type, bidModel.type, 'bid type incorrect');
    assert.equal(bid.provider, bidModel.provider, 'bid provider incorrect');
    assert.deepEqual(bid.sizes, bidModel.dimensions, 'bid dimensions incorrect');

  });

  it('should not fail on fromObject with custom object properties', function() {
    var bid = Bid.fromObject({
      a: 'a',
      b: { b: 0 },
      c: function() { return 1; }
    });
    assert.equal(bid.a, 'a', 'bid.a should be \"a\"');
    assert.equal(bid.b.b, 0, 'bid.b.b should be 0');
    assert.equal(bid.c(), 1, 'bid.c should return 1');
  });

  it('should create a bid object with a numeric zero value', function() {
    var bid = Bid.fromObject({});
    assert.equal(bid.value, 0, 'bid value should be zero (0)');

    bid = Bid.fromObject({ zero: 0 });
    assert.equal(bid.zero, 0, 'bid key \"zero\" should be zero (0)');

    bid = Bid.fromObject({targeting: { zero: 0 }});
    assert.equal(bid.targeting.zero, 0, 'bid key \"zero\" should be zero (0)');
  });

  it('should create a bid object with falsey values', function() {
    var bid = Bid.fromObject({});
    assert.equal(bid.value, 0, 'bid value should be zero (0)');

    bid = Bid.fromObject({ value: 0 });
    assert.equal(bid.value, 0, 'bid key \"value\" should be zero (0)');

    bid = Bid.fromObject({targeting: { empty: '' }});
    assert.equal(bid.targeting.empty, '', 'bid key \"empty\" should be an empty string');

    bid = Bid.fromObject({targeting: { 'undefined': undefined }});
    assert.equal(bid.targeting['undefined'], undefined, 'bid key \"undefined\" should be undefined');
  });

  it('should set Bid object value with falsey values', function() {
    var bid = new Bid(5);
    assert.equal(bid.value, 5, 'bid value should be five (5)');

    bid.setValue(0);
    assert.equal(bid.value, 0, 'bid value should be zero (0)');
    assert.equal(util.asType(bid.value), 'number', 'bid value should be numeric');

    bid.setValue('');
    assert.equal(bid.value, '', 'bid value should be an empty string');
    assert.equal(util.asType(bid.value), 'string', 'bid value should be string');

    bid.setValue(false);
    assert.equal(bid.value, false, 'bid value should be a boolean false');
    assert.equal(util.asType(bid.value), 'boolean', 'bid value should be boolean');

    bid.setValue();
    assert.equal(bid.value, '', 'bid value should be an empty string');
    assert.equal(util.asType(bid.value), 'string', 'bid value should be a string');

  });
});
