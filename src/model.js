/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

/**
 * Domain objects live here..
 * @namespace pubfood/model
 */

/** @module */

var BaseModelObject = require('./model/basemodelobject');
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
  },
  BaseModelObject: BaseModelObject,
  Slot: Slot,
  Bid: Bid
};

module.exports = model;
