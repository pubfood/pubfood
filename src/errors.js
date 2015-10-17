/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Errors live here..
 */

'use strict';

var ERR_NAME = 'PubfoodError';
/**
 * Pubfood Error
 * @class
 * @memberof pubfood
 * @param {string} message - the error description
 * @return {pubfood.PubfoodError}
 */
function PubfoodError(message) {
  this.name = ERR_NAME;
  this.message = message || 'Pubfood integration error.';
  this.stack = (new Error()).stack;
}

PubfoodError.prototype = Object.create(Error.prototype);
PubfoodError.prototype.constructor = PubfoodError;
PubfoodError.prototype.name = ERR_NAME;
PubfoodError.prototype.is = function(err) {
  return err && err.name === ERR_NAME;
};

module.exports = PubfoodError;
