/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Slot = require('../../src/model/slot.js');

describe('Slot', function testSlotBuilder() {
  var slotConfig = {
    name: '/2476204/sidebar-unit', // ad unit
    sizes: [
      [300, 250],
      [300, 600]
    ],
    elementId: '_300x250', //div element on the page
    bidProviders: [
      'yieldbot',
      'walkathon'
    ]
  };

  var slotModel = {
    name: 'right-rail',
    elementId: 'targetDomId',
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
    assert.deepEqual(slot.bidProviders, slotConfig.bidProviders, 'fromObject bidProvider mismatch');
  });

  it('with an internal id', function() {
    var slot = Slot.fromObject(slotConfig);
    assert.isDefined(slot.id, 'id is not defined');
    assert.match(slot.id, /[\w]+$/, 'id is not an ascii string');
  });

  it('with a name and elementId', function() {
    var slot = new Slot(slotModel.name, slotModel.elementId);
    assert.equal(slot.name, slotModel.name, 'slot name not set');
    assert.equal(slot.elementId, slotModel.elementId, 'slot elementId not set');
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
    var slot = new Slot(slotModel.name).
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

  describe('Set Custom Parameters', function() {
    it('will set and get custom parameters', function() {
      var slot = new Slot();

      slot.setParam('aString', 'theString');
      assert.isTrue(slot.getParam('aString') === 'theString', 'should have parameter value: \"theString\"');

      slot.setParam('aBoolean', true);
      assert.isTrue(slot.getParam('aBoolean'), 'should have parameter value: true');

      slot.setParam('aNumber', 3.14);
      assert.isTrue(slot.getParam('aNumber') === 3.14, 'should have parameter value: 3.14');

      slot.setParam('anObject', {key: 'value'});
      assert.deepEqual(slot.getParam('anObject'), {key: 'value'}, 'should have parameter value: {key: \"value\}"');

      slot.setParam('anArray', ['value', 3.14]);
      assert.deepEqual(slot.getParam('anArray'), ['value', 3.14], 'should have parameter value: [\"value\", 3.14]');

      var aFunction = function(num) {
        return ++num;
      };
      slot.setParam('aFunction', aFunction);
      assert.isTrue(slot.getParam('aFunction').call(null, 0) === 1, 'should execute the function');
    });

    it('should allow fluent param creation', function() {
      var slot = new Slot();

      slot.setParam('p1', 0)
        .setParam('p2', 1)
        .setParam('p3', 2)
        .setParam('p4', 4)
        .setParam('p5', 6)
        .setParam('p6', 8);

      var values = slot.getParams();

      var sum = 0;
      values.map(function(v) {
        sum += v;
      });
      assert.isTrue(sum === 21, 'key iteration should produce value of 21');

    });

    it('should not set parameter with undefined name', function() {
      var slot = new Slot();
      var foo;
      slot.setParam(foo, 0).
        setParam('p1', 1);
      assert.isTrue(slot.getParamKeys().length === 1, 'should only have 1 key');
      assert.isTrue(slot.getParamKeys()[0] === 'p1', 'should have key of \"p1\"');
      assert.isTrue(slot.getParam('p1') === 1, 'parameter \"p1\" should have value of 1');
    });

    it('should only add string, number or boolean parameter keys', function() {
      var slot = new Slot();

      slot.setParam({p1: 'p1'}, 0)
        .setParam(['p2'], 1)
        .setParam(0, 2)
        .setParam(1.01, 2.1)
        .setParam('p4', 4)
        .setParam('', 4.1)
        .setParam(function(){}, 6)
        .setParam(true, 8);

      assert.isTrue(slot.getParamKeys().length === 5, 'should only have 5 keys');
      assert.isTrue(slot.getParamKeys()[0] === '0', 'should have first key of \"0\"');
      assert.isTrue(slot.getParamKeys()[1] === '1.01', 'should have second key of \"1.01\"');
      assert.isTrue(slot.getParamKeys()[2] === 'p4', 'should have third key of \"p4\"');
      assert.isTrue(slot.getParamKeys()[3] === '', 'should have fourth key of \"\"');
      assert.isTrue(slot.getParamKeys()[4] === 'true', 'should have fifth key of \"true\"');
      assert.isTrue(slot.getParam('0') === 2, 'parameter \"0\" should have value of 2');
      assert.isTrue(slot.getParam('1.01') === 2.1, 'parameter \"1.01\" should have value of 2.1');
      assert.isTrue(slot.getParam('p4') === 4, 'parameter \"p4\" should have value of 4');
      assert.isTrue(slot.getParam('') === 4.1, 'parameter \"\" should have value of 4.1');
      assert.isTrue(slot.getParam('true') === 8, 'parameter \"true\" should have value of 8');
    });
  });
});
