/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var BaseModelObject = require('../../src/model/basemodelobject');

describe('BaseModelObject', function testBaseModelObject() {
  it('will have a generated Id', function() {
    var modelObject = new BaseModelObject();
    assert.isDefined(modelObject.id, 'id is not defined');
    assert.match(modelObject.id, /[\w]+$/, 'id is not an ascii string');
  });
});
