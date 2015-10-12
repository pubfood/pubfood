/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/**
 * Mediators and Assemblers live here..
 * @namespace pubfood/mediator
 */

var AuctionMediator = require('./mediator/auctionmediator');

/**
 * Coordinates and orchestrates Mediator and Assembler instances.
 *
 * @module
 * @memberof pubfood
 */
var mediator = {
  mediatorBuilder: function() {
    return new AuctionMediator();
  }
};

module.exports = mediator;
