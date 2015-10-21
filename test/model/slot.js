/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Slot = require('../../src/model/slot.js');

describe('Slot', function testSlotBuilder() {
  var slotConfig = {
    name: '/2476204/sidebar-unit', //google ad unit
    sizes: [
      [300, 250],
      [300, 600]
    ],
    elementId: '_300x250', //div element on the page
    bidProviders: {
      yieldbot: {
        slot: 'sidebar' //yieldbot's slot name
      },
      amazon: {
        slot: 'amz-left-adslot' // amazon's slot name
      }
    }
  };

  var slotModel = {
    name: 'right-rail',
    dimensions: [ [300, 250], [300, 600] ]
  };

  it('will not build a slot with invalid config object', function() {

    var invalidSlotConfig = JSON.parse(JSON.stringify(slotConfig));
    invalidSlotConfig.name = '';

    var slot = Slot.fromObject(invalidSlotConfig);
    assert.isNull(slot, 'should not be a valid slot');
  });

  it('will build a slot from a config object', function() {
    var slot = Slot.fromObject(slotConfig);
    assert.isNotNull(slot, 'invalid slot');
  });

  it('with an internal id', function() {
    var slot = Slot.fromObject(slotConfig);
    assert.isDefined(slot.id, 'id is not defined');
    assert.match(slot.id, /[\w]+$/, 'id is not an ascii string');
  });

  it('with a name', function() {
    var slot = new Slot().name(slotModel.name);
    assert.equal(slot.name, slotModel.name, 'slot name not set');
  });

  it('with a dimensions array', function() {
    var slot = new Slot(),
      i = 0,
      dim = slotModel.dimensions;

    for (i; i < dim.length; i++) {
      var width = dim[i][0];
      var height = dim[i][1];
      slot.addSize(width, height);
    }
    assert.deepEqual(slot.sizes, slotModel.dimensions, 'slot dimensions not set');
  });

  it('with a name and dimensions in fluent chain', function() {
    var slot = new Slot().
        name('right-rail').
        addSize(300, 250).
        addSize(300, 600);
    assert.equal(slot.name, slotModel.name, 'slot name not set');
    assert.deepEqual(slot.sizes, slotModel.dimensions, 'slot dimensions not set');
  });

  it('with String dimension arguments', function() {
    var slot = new Slot().
        addSize('300', '250');
    assert.deepEqual(slot.sizes, [ [300, 250] ], 'dimensions not equal');
  });

  it('will zero for non-numeric and round abs for float dimension arguments', function() {
    var slot = new Slot()
        .addSize(300, '&')
        .addSize('T', '&')
        .addSize('8:3', '600')
        .addSize('728.999', '-90.2');
    assert.deepEqual(slot.sizes, [ [300, 0], [0, 0], [0, 600], [728, 90] ], 'dimensions not equal');
  });
});

