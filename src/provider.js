/**
 * pubfood
 *
 * Providers live here..
 */

'use strict';
require('./provider/baseprovider');
require('./provider/bidprovider');
require('./provider/auctionprovider');
require('./provider/biddelegate');
require('./provider/creativeprovider');

/**
 * Coordinates and orchestrats Provider instances.
 *
 * @memberof pubfood
 * @private
 */
var provider = {
  /**
   *
   * @param {string} type
   * @return {Provider|null}
   */
  getType: function(type) {
    type = ('' + type).toLowerCase();
    var model = null;
    try {
      model = require('./provider/' + type);
    } catch(e){
      console.log('ERROR', e);
    }
    return model;
  },
};

module.exports = provider;
