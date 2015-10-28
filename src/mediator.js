/**
 * pubfood
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
  mediatorBuilder: function(config) {
    return new AuctionMediator(config);
  }
};

module.exports = mediator;
