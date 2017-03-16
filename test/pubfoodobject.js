/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var PubfoodObject = require('../src/pubfoodobject');

describe('PubfoodObject', function testPubfoodObject() {
  it('will have a generated Id', function() {
    var pubfoodObject = new PubfoodObject();
    assert.isDefined(pubfoodObject.id, 'id is not defined');
    assert.match(pubfoodObject.id, /[\w]+$/, 'id is not an ascii string');
  });

  it('will set and get custom parameters', function() {
    var pubfoodObject = new PubfoodObject();

    pubfoodObject.setParam('aString', 'theString');
    assert.isTrue(pubfoodObject.getParam('aString') === 'theString', 'should have parameter value: \"theString\"');

    pubfoodObject.setParam('aBoolean', true);
    assert.isTrue(pubfoodObject.getParam('aBoolean'), 'should have parameter value: true');

    pubfoodObject.setParam('aNumber', 3.14);
    assert.isTrue(pubfoodObject.getParam('aNumber') === 3.14, 'should have parameter value: 3.14');

    pubfoodObject.setParam('anObject', {key: 'value'});
    assert.deepEqual(pubfoodObject.getParam('anObject'), {key: 'value'}, 'should have parameter value: { key:\"value\"}');

    pubfoodObject.setParam('anArray', ['value', 3.14]);
    assert.deepEqual(pubfoodObject.getParam('anArray'), ['value', 3.14], 'should have parameter value: [\"value\", 3.14]');

    var aFunction = function(num) {
      return ++num;
    };
    pubfoodObject.setParam('aFunction', aFunction);
    assert.isTrue(pubfoodObject.getParam('aFunction').call(null, 0) === 1, 'should execute the function');
  });

  it('should allow fluent param creation', function() {
    var pubfoodObject = new PubfoodObject();

    pubfoodObject.setParam('p1', 0)
      .setParam('p2', 1)
      .setParam('p3', 2)
      .setParam('p4', 4)
      .setParam('p5', 6)
      .setParam('p6', 8);

    var keys = pubfoodObject.getParamKeys();

    var sum = 0;
    keys.forEach(function(v) {
      sum += pubfoodObject.getParam(v);
    });
    assert.isTrue(sum === 21, 'key iteration should produce value of 21');

  });

  it('should not set parameter with undefined name', function() {
    var pubfoodObject = new PubfoodObject();
    var foo;
    pubfoodObject.setParam(foo, 0).
      setParam('p1', 1);
    assert.isTrue(pubfoodObject.getParamKeys().length === 1, 'should only have 1 key');
    assert.isTrue(pubfoodObject.getParamKeys()[0] === 'p1', 'should have key of \"p1\"');
    assert.isTrue(pubfoodObject.getParam('p1') === 1, 'parameter \"p1\" should have value of 1');
  });

  it('should only add string, number or boolean parameter keys', function() {
    var pubfoodObject = new PubfoodObject();

    pubfoodObject.setParam({p1: 'p1'}, 0)
      .setParam(['p2'], 1)
      .setParam(0, 2)
      .setParam(1.01, 2.1)
      .setParam('p4', 4)
      .setParam('', 4.1)
      .setParam(function(){}, 6)
      .setParam(true, 8);

    assert.isTrue(pubfoodObject.getParamKeys().length === 5, 'should only have 5 keys');
    assert.isTrue(pubfoodObject.getParamKeys()[0] === '0', 'should have first key of \"0\"');
    assert.isTrue(pubfoodObject.getParamKeys()[1] === '1.01', 'should have second key of \"1.01\"');
    assert.isTrue(pubfoodObject.getParamKeys()[2] === 'p4', 'should have third key of \"p4\"');
    assert.isTrue(pubfoodObject.getParamKeys()[3] === '', 'should have fourth key of \"\"');
    assert.isTrue(pubfoodObject.getParamKeys()[4] === 'true', 'should have fifth key of \"true\"');
    assert.isTrue(pubfoodObject.getParam('0') === 2, 'parameter \"0\" should have value of 2');
    assert.isTrue(pubfoodObject.getParam('1.01') === 2.1, 'parameter \"1.01\" should have value of 2.1');
    assert.isTrue(pubfoodObject.getParam('p4') === 4, 'parameter \"p4\" should have value of 4');
    assert.isTrue(pubfoodObject.getParam('') === 4.1, 'parameter \"\" should have value of 4.1');
    assert.isTrue(pubfoodObject.getParam('true') === 8, 'parameter \"true\" should have value of 8');
  });

  it('should iterate parameter keys and values', function () {
    var pubfoodObject = new PubfoodObject();

    pubfoodObject.setParam('p0', 0)
      .setParam('p1', 1)
      .setParam('p2', 2)
      .setParam('p3', 3)
      .setParam('p4', 4);

    var pKeys = pubfoodObject.getParamKeys();
    var pCount = 0;
    for (var idx = 0; idx < pKeys.length; idx++) {
      var pKey = pKeys[idx];
      var pVal = pubfoodObject.getParam(pKey);
      pCount += pVal;
    }

    assert.isTrue(pCount === 10, 'param value count not equal');
  });
});
