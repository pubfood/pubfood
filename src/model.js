'use strict';

/**
 * Domain objects live here..
 * @namespace pubfood/model
 */

/** @module */

var Slot = require('./model/slot');
var Bid = require('./model/bid');

/**
 * Coordinates and orchestrates domain model instances.
 *
 * @memberof pubfood
 */
var model = {
  slotBuilder: function(data) {
    return new Slot();
  },
  bidBuilder: function(data) {
    return new Bid();
  }
};

module.exports = model;
