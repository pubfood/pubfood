'use strict';

/**
 * Domain objects live here..
 * @namespace pubfood/model
 */


var Slot = require('./model/slot');
var Bid = require('./model/bid');

/**
 * Coordinates and orchestrates domain model instances.
 *
 * @module
 * @memberOf pubfood
 */
var model = {
    SlotBuilder: function(data) {
        return new Slot();
    },
    BidBuilder: function(data) {
        return new Bid();
    }
};

module.exports = model;
