
'use strict';

var ERR_NAME = 'PubfoodError';
/**
 * Pubfood Error
 *
 * @param {string} message - the error description
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
