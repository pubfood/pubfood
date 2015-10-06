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
 * @memberOf pubfood
 */
var mediator = {
    AuctionMediatorBuilder: function() {
        return new AuctionMediator();
    },
    BidMediatorBuilder: function() {
        return new BidMediator();
    }
};

module.exports = mediator;
