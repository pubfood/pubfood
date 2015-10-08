/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

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
  bidAssemblerBuilder: function() {
    return new BidAssembler();
  }
};

module.exports = assembler;
