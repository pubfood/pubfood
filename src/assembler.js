/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Assemblers live here..
 */

'use strict';

var fs = require('fs');

/**
 * Coordinates and orchestrates Assembler instances.
 *
 * @memberof pubfood
 * @instance
 */
var assembler = {
  /**
   * @type {object}
   * @private
   */
  _types: (function() {
    var obj = {};
    var path = './assembler/';
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

console.log(assembler.getType('foo'));
console.log('');
console.log('baseassembler', assembler.getType('baseassembler'));
console.log('');
console.log('bidassembler', assembler.getType('bidassembler'));

module.exports = assembler;
