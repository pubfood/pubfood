/**
 * pubfood
 *
 * Domain objects live here..
 */

'use strict';
require('./model/slot');
require('./model/bid');

/**
 * Coordinates and orchestrates domain model instances.
 *
 * @memberof pubfood
 * @property {function} getType Returns an instance of Bid or Slot model [PubfoodObject]{@link pubfood#PubfoodObject}
 * @private
 */
var model = {
  getType: function(type) {
    type = ('' + type).toLowerCase();
    var model = null;
    try {
      model = require('./model/' + type);
    } catch(e){
      console.log('ERROR', e);
    }
    return model;
  },
};

module.exports = model;
