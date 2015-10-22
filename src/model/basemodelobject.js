/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');

/**
 * BaseModelObject is a base type for [Model]{@link pubfood#model} types.
 *
 * @class
 * @memberof pubfood#model
 * @ignore
 */
function BaseModelObject() {
  this.id = util.newId();
}

module.exports = BaseModelObject;
