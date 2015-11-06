/**
 * pubfood
 *
 * Assemblers live here..
 */

'use strict';
require('./assembler/baseassembler');
require('./assembler/bidassembler');
/**
 * Coordinates and orchestrates Assembler instances.
 *
 * @memberof pubfood
 * @property {function} getType Returns an instances of [Assembler]{@link pubfood#assembler.BaseAssembler}
 * @private
 */
var assembler = {
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

module.exports = assembler;
