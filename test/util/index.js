/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 */
'use strict';

var assert = require('chai').assert;
var util = require('../../src/util');

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
describe('Util - Tests', function () {
  it('should test array type', function() {
    assert.isTrue(util.isArray([]), 'empty array should be an array');
    assert.isTrue(util.isArray([1, 2, 3]), 'should be an array');
    assert.isTrue(util.isArray([1, 2], [3, 4]), 'should be an array of arrays');
    assert.isFalse(util.isArray({}), 'object should not be an array');
    assert.isFalse(util.isArray(false), 'false should not be an array');
    assert.isFalse(util.isArray(null), 'null should not be an array');
    var u;
    assert.isFalse(util.isArray(u), 'undefined should not be an array');
  });

  it('should test object type', function() {
    assert.isTrue(util.isObject({}), 'should be an object');
    assert.isTrue(util.isObject({1:2, 3:4}), 'should be an object');
    assert.isFalse(util.isObject([]), 'array should not be an object');
    assert.isFalse(util.isObject([[1], [2]]), 'array of arrays should not be an object');
    assert.isFalse(util.isObject(false), 'false should not be an object');
    assert.isFalse(util.isObject(null), 'null should not be an object');
    var u;
    assert.isFalse(util.isObject(u), 'undefined should not be an object');
  });

  it('should merge arrays', function() {
    var a1 = [1, 2, 3];
    var a2 = [4, 5, 6];

    assert.deepEqual(util.mergeToArray(a1, a2), [1, 2, 3, 4, 5, 6], 'should have equal values');
    assert.deepEqual(util.mergeToArray([[300, 250]], [[728, 90]]), [[300, 250], [728, 90]], 'should have equal values');
  });

  it('should merge objects', function() {
    var o1 = {'5': 5, '4': 4};
    var o2 = {1: '1', 2: '2'};

    var expected = {1: '1', 2: '2', '5': 5, '4': 4};
    assert.deepEqual(util.mergeToObject(o1, o2), expected, 'should have equal values');

    o1.o = {'a': 6};
    o2.oo = {'6': 'd'};

    expected.o = {'a': 6};
    expected.oo = {'6': 'd'};
    assert.deepEqual(util.mergeToObject(o1, o2), expected, 'should have equal values');

    o2.v = [[0, 9]];
    expected.v = [[0, 9]];
    assert.deepEqual(util.mergeToObject(o1, o2), expected, 'should have equal values');

    o1 = { foo: { bar: 'mumble' } };
    o2 = { frotz: { plotz: 'grumble' } };
    expected = { foo: { bar: 'mumble' }, frotz: { plotz: 'grumble' } };
    assert.deepEqual(util.mergeToObject(o1, o2), expected, 'should have equal values');


    var o3 = util.mergeToObject(o1, o2);
    o1.foo.bar = 'grumble';

    assert.isTrue(o3.foo.bar === o1.foo.bar, 'should be a reference');

    o1.arr = [0, 0];
    o2.arr2 = [1, 1];

    o3 = util.mergeToObject(o1, o2);
    assert.isTrue(o3.arr[0] === 0, 'should be a reference');

    o1.arr[0] = 1;
    o1.arr[1] = 1;

    assert.isTrue(o3.arr[0] === 1, 'should be a reference');


    o1 = null;
    o2 = null;
    o1 = { a: 'b', c: { d: 'e' }, z: ['w'] };
    o2 = { f: 'g', h: { i: 'k' }, l: ['m'] };

    var c1 = util.cloneObject(o1);
    var c2 = util.cloneObject(o2);
    var c3 = util.mergeToObject(c1, c2);

    o2.f = 'x';
    o1.z[0] = 'x';
    assert.isTrue(c3.f === 'g' && c3.z[0] === 'w', 'should not be a reference');

  });
});
