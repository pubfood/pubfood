'use strict';

/**
 * Mediators and Assemblers live here..
 * @namespace pubfood/mediator
 */

var AuctionMediator = require('./mediator/auctionmediator');
var BidMediator = require('./mediator/bidmediator');
var ReportMediator = require('./mediator/reportmediator');

/**
 * Coordinates and orchestrates Mediator and Assembler instances.
 *
 * @module
 * @memberof pubfood
 */
var mediator = {
  auctionMediatorBuilder: function(config) {
    return new AuctionMediator(config);
  },
  bidMediatorBuilder: function(config) {
    return new BidMediator(config);
  },
  reportMediatorBuilder: function(config) {
    return new ReportMediator(config);
  }
};

module.exports = mediator;
