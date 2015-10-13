/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Domain objects live here..
 */

'use strict';

var fs = require('fs');

/**
 * Coordinates and orchestrates domain model instances.
 *
 * @memberof pubfood
 * @instance
 */
var model = {
  /**
   * @type {object}
   * @private
   */
  _types: (function() {
    var obj = {};
    var path = './model/';
    fs.readdirSync(path).forEach(function(f) {
      var name = f.split('.')[0];
      obj[name] = require(path + f);
    });

    return obj;
  })(),
  /**
   *
   * @param {string} type
   * @return {Model|null}
   */
  getType: function(type) {
    type = ('' + type).toLowerCase();
    return this._types[type] || null;
  },
};

//console.log(model.getType('foo'));
//console.log('');
//console.log('bid', model.getType('bid'));
//console.log('');
//console.log('slot', model.getType('slot'));

module.exports = model;
