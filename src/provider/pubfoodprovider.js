/**
 * pubfood
 */

'use strict';

var PubfoodObject = require('../pubfoodobject');
var util = require('../util');

/**
 * Provider is a base type for pubfood provider types.
 *
 * @class
 */
function PubfoodProvider() {
  this.throwErrors_ = false;
}

/**
 * Re-throw caught delegate errors.
 *
 * Default: false
 * @param {boolean} silent if true: re-throw errors in [BidDelegate]{@link typeDefs.BidDelegate} and [AuctionDelegate]{@link typeDefs.AuctionDelegate} functions
 * @return {boolean}
 */
PubfoodProvider.prototype.throwErrors = function(silent) {
  if (util.asType(silent) === 'boolean') {
    this.throwErrors_ = silent;
  }
  return this.throwErrors_;
};

util.extendsObject(PubfoodProvider, PubfoodObject);
module.exports = PubfoodProvider;
