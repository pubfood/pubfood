/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Domain objects live here..
 */

'use strict';

/**
 * Coordinates and orchestrates domain model instances.
 *
 * @memberof pubfood
 * @instance
 */
var model = {
  /**
   *
   * @param {string} type
   * @return {Model|null}
   */
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

//console.log(model.getType('foo'));
//console.log('');
//console.log('bid', model.getType('bid'));
//console.log('');
//console.log('slot', model.getType('slot'));

module.exports = model;
