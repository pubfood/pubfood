'use strict';

/**
 * Assemblers live here..
 * @namespace pubfood/assembler
 */

var BidAssembler = require('./assembler/bidassembler');

/**
 * Coordinates and orchestrates Assembler instances.
 *
 * @module
 * @memberof pubfood
 */
var assembler = {
  buildBidAssembler: function() {
    return new BidAssemler();
  }
};

module.exports = assembler;
