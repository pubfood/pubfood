/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Providers live here..
 */

'use strict';

var fs = require('fs');

/**
 * Coordinates and orchestrats Provider instances.
 *
 * @memberof pubfood
 * @instance
 */
var provider = {
  /**
   * @type {object}
   * @private
   */
  _types: (function() {
    var obj = {};
    var path = './provider/';
    fs.readdirSync(path).forEach(function(f) {
      var name = f.split('.')[0];
      obj[name] = require(path + f);
    });

    return obj;
  })(),
  /**
   *
   * @param {string} type
   * @return {Provider|null}
   */
  getType: function(type) {
    type = ('' + type).toLowerCase();
    return this._types[type] || null;
  },
};

//console.log(provider.getType('foo'));
//console.log('');
//console.log('auctionprovider', provider.getType('auctionprovider'));
//console.log('');
//console.log('baseprovider', provider.getType('baseprovider'));
//console.log('');
//console.log('biddelegate', provider.getType('biddelegate'));
//console.log('');
//console.log('bidprovider', provider.getType('bidprovider'));
//console.log('');
//console.log('creativeprovider', provider.getType('creativeprovider'));

module.exports = provider;
