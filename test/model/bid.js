/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Bid = require('../../src/model/bid.js');

describe('Model builder will build a Bid', function testBidBuilder() {

  var bidModel = {
    value: 3.75,
    type: 'number',
    slot: 'right-rail',
    dimensions: [ [300, 250], [300, 600] ],
    provider: 'foobar'
  };

  it('with an internal Id', function() {
    var bid = new Bid();
    assert.isDefined(bid.id, 'id is not defined');
    assert.match(bid.id, /[\w]+$/, 'id is not an ascii string');
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
        bid = new Bid().
        value(value);

      assert.equal(bid.value, value, 'bid value incorrect');
      assert.isDefined(bid.type, 'bid type undefined');
      assert.equal(bid.type, type, 'bid type incorrect');
    }
  });

  it('with a provider, slot name, dimensions and bid value', function() {
    var bid = new Bid().
        value(bidModel.value).
        addSize(bidModel.dimensions[0][0], bidModel.dimensions[0][1]).
        addSize(bidModel.dimensions[1][0], bidModel.dimensions[1][1]).
        provider(bidModel.provider);

    assert.equal(bid.value, bidModel.value, 'bid value incorrect');
    assert.equal(bid.type, bidModel.type, 'bid type incorrect');
    assert.equal(bid.provider, bidModel.provider, 'bid provider incorrect');
    assert.deepEqual(bid.sizes, bidModel.dimensions, 'bid dimensions incorrect');

  });
});
