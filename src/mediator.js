/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Mediators and Assemblers live here..
 */

'use strict';

var AuctionMediator = require('./mediator/auctionmediator');

/**
 * Coordinates and orchestrates Mediator and Assembler instances.
 *
 * @memberof pubfood
 */
var mediator = {
  mediatorBuilder: function() {
    return new AuctionMediator();
  }
};

module.exports = mediator;
