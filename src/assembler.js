/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Assemblers live here..
 */

'use strict';

var BidAssembler = require('./assembler/bidassembler');

/**
 * Coordinates and orchestrates Assembler instances.
 *
 * @memberof pubfood
 */
var assembler = {
  bidAssemblerBuilder: function() {
    return new BidAssembler();
  }
};

module.exports = assembler;
