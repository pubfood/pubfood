/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
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
 * @instance
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


// console.log('');
// console.log('auctionprovider', provider.getType('auctionprovider'));
// console.log('');
// console.log('baseprovider', provider.getType('baseprovider'));
// console.log('');
// console.log('biddelegate', provider.getType('biddelegate'));
// console.log('');
// console.log('bidprovider', provider.getType('bidprovider'));
// console.log('');
// console.log('creativeprovider', provider.getType('creativeprovider'));

module.exports = provider;
