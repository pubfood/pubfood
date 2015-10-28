/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var PubfoodError = require('../../src/errors');

describe('Errors - Tests', function () {
  describe('PubfoodError object', function testTmpl() {
    it('type can be checked', function() {
      var MSG = 'This is a test',
        err = new PubfoodError(MSG),
        cmp = new PubfoodError('Is one of these');

      assert.isTrue(err.is(cmp), 'not a PubfoodError');
      assert.isTrue(err.message === MSG);
    });
  });

});
