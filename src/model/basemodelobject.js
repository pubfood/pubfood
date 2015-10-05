'use strict';

var util = require('../util');

/**
 * BaseModelObject is a base type for {@link pubfood/provider} types.
 *
 * @class
 * @memberOf pubfood/model
 */
function BaseModelObject() {
  this.id = util.newId();
}

module.exports = BaseModelObject;
