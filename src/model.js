/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Domain objects live here..
 */

'use strict';

/*eslint no-unused-vars: 0*/

//var BaseModelObject = require('./model/basemodelobject');
var Slot = require('./model/slot');
var Bid = require('./model/bid');

/**
 * Coordinates and orchestrates domain model instances.
 *
 * @memberof pubfood
 * @enum {Model}
 * @inner
 */
var model = {
  //slotBuilder: function() {
  //  return new Slot();
  //},
  //bidBuilder: function() {
  //  return new Bid();
  //},
  //BaseModelObject: BaseModelObject,
  Slot: Slot,
  Bid: Bid
};

module.exports = model;
