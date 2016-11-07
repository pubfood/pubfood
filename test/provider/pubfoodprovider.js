/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var PubfoodProvider = require('../../src/provider/pubfoodprovider');

describe('PubfoodProvider', function testPubfoodProvider() {
  it('should set throwErrors property', function() {
    var pubfoodProvider = new PubfoodProvider();
    assert.isFalse(pubfoodProvider.throwErrors());
  });

  it('should not set throwErrors property unless boolean provided', function() {
    var pubfoodProvider = new PubfoodProvider();
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors('');
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors('true');
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors(1);
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors({});
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors([]);
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors(function () { return true;});
    assert.isFalse(pubfoodProvider.throwErrors());

    pubfoodProvider.throwErrors(true);
    assert.isTrue(pubfoodProvider.throwErrors());
  });
});