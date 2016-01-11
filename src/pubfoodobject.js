/**
 * pubfood
 */

'use strict';

var util = require('./util');

/**
 * PubfoodObject is a base type for pubfood types.
 *
 * @class
 */
function PubfoodObject() {
  this.id = util.newId();
  this.params_ = {};
}

/**
 * Set an object parameter.
 *
 * @param {string|number|boolean} name the parameter name
 * @param {mixed} value the parameter value
 * @return {PubfoodObject} this slot
 */
PubfoodObject.prototype.setParam = function(name, value) {
  var type = util.asType(name);
  if (type !== 'object' && type !== 'array' && type !== 'function' && type !== 'undefined') {
    this.params_[name] = value;
  }
  return this;
};

/**
 * Get an object parameter.
 *
 * @param {string} name the parameter name
 * @return {mixed} the parameter value
 */
PubfoodObject.prototype.getParam = function(name) {
  return this.params_[name];
};

/**
 * Get all parameter keys.
 *
 * @return {string[]} this parameter key array
 */
PubfoodObject.prototype.getParamKeys = function() {
  var ret = [];
  for (var i in this.params_) {
    ret.push(this.params_[i]);
  }
  return ret;
};

module.exports = PubfoodObject;
