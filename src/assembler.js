/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Assemblers live here..
 */

'use strict';

/**
 * Coordinates and orchestrates Assembler instances.
 *
 * @memberof pubfood
 * @instance
 */
var assembler = {
  /**
   *
   * @param {string} type
   * @return {Provider|null}
   */
  getType: function(type) {
    type = ('' + type).toLowerCase();
    var model = null;
    try {
      model = require('./assembler/' + type);
    } catch(e){
      console.log('ERROR', e);
    }
    return model;
  },
};

//console.log(assembler.getType('foo'));
//console.log('');
//console.log('baseassembler', assembler.getType('baseassembler'));
//console.log('');
//console.log('bidassembler', assembler.getType('bidassembler'));

module.exports = assembler;
