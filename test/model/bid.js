/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Bid = require('../../src/model/bid.js');
var bid1 = require('../fixture/bid1.js');

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
    var bids = bid1.valid;
    for (var i = 0; i < bids.length; i++) {
      var bid = Bid.fromObject(bids[i]);
      assert.isDefined(bid, 'bid is not defined');
      assert.isDefined(bid.id, 'id is not defined');
      assert.match(bid.id, /[\w]+$/, 'id is not an ascii string');
    }
  });

  it('should be valid', function() {
    var bids = bid1.invalid;
    for (var i = 0; i < bids.length; i++) {
      var bid = Bid.fromObject(bids[i]);
      assert.isNull(bid, 'bid should be null');
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
        bid = new Bid('slotName', value, [[300, 250]]);


      assert.equal(bid.value, value, 'bid value incorrect');
      assert.isDefined(bid.type, 'bid type undefined');
      assert.equal(bid.type, type, 'bid type incorrect');
    }
  });

  it('with a provider, slot name, dimensions and bid value', function() {
    var bid = new Bid('slotName', bidModel.value, bidModel.dimensions);
    bid.provider = bidModel.provider;

    assert.equal(bid.value, bidModel.value, 'bid value incorrect');
    assert.equal(bid.type, bidModel.type, 'bid type incorrect');
    assert.equal(bid.provider, bidModel.provider, 'bid provider incorrect');
    assert.deepEqual(bid.sizes, bidModel.dimensions, 'bid dimensions incorrect');

  });
});
