/**
 * pubfood
 */

'use strict';
/** @namespace util */
var util = {
  /**
   * Get the type name of an object.
   *
   * @see https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
   *
   * @function asType
   * @returns {string}
   * @memberof util
   */
  asType: function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  },
  newId: function() {
    /*jslint bitwise: true */
    return (+new Date()).toString(36) + 'xxxxxxxxxx'
      .replace(/[x]/g, function() {
        return (0 | Math.random() * 36).toString(36);
      });
    /*jslint bitwise: false */
  },
  /*
   * Simple class extension/inheritance
   *
   * @todo refactor to use? - https://github.com/isaacs/inherits
   */
  extends: function(child, parent) {

    for (var k in parent.prototype) {
      child.prototype[k] = parent.prototype[k];
    }

    child.prototype.parents = child.prototype.parents || [];
    child.prototype.parents.push(function() {
      return parent;
    });

    child.prototype.init_ = function() {
      var parents = this.parents || [];

      for (var i in parents) {
        parents[i]().call(this);
      }
    };
  },
  hasFunctions: function(object, fnNames) {
    if (!object)  return false;

    var ret = true;
    for (var i = 0; i < fnNames.length; i++) {
      var name = fnNames[i];
      if (!object[name] || !util.asType(object[name]) === 'function') {
        ret = false;
        break;
      }
    }
    return ret;
  },
  loadUri: function(uri, sync) {
    var doc = document;
    var scriptSrc = uri || '';
    if (sync) {
      if (doc.readyState === 'complete' || doc.readyState === 'loaded') {
        // TODO consider warning of an unsafe attempt to document.write too late
      } else {
        /*eslint-disable no-empty */
        try {
          doc.write('<script src="' + scriptSrc + '"></script>');
        } catch (e) { }
        /*eslint-enable no-empty: */
      }
    } else {
      var scriptEl = document.createElement('script');
      scriptEl.async = true;
      scriptEl.src = scriptSrc;
      (doc.head || doc.body || doc.documentElement).appendChild(scriptEl);
    }
  },
  bind: function(fn, ctx) {
    return function() {
      fn.apply(ctx, Array.prototype.slice.call(arguments));
    };
  },
  mergeToObject: function(o1, o2) {
    for (var p in o2) {
      if (o2.hasOwnProperty(p)) {
        if (this.isObject(o2[p])) {
          if (!o1[p]) {
            o1[p] = {};
          }
          this.mergeToObject(o1[p], o2[p]);
        } else if (this.isArray(o2[p])) {
          if (!o1[p]) {
            o1[p] = [];
          }
          this.mergeToArray(o1[p], o2[p]);
        } else {
          o1[p] = o2[p];
        }
      }
    }
    return o1;
  },
  mergeToArray: function(a1, a2) {
    for (var i = 0; i < a2.length; i++) {
      a1.push(this.clone(a2[i]));
    }
    return a1;
  },
  isArray: function(o) {
    return !!o && this.asType(o) === 'array';
  },
  isObject: function(o) {
    return !!o && this.asType(o) === 'object';
  },
  clone: function(v) {
    return this.isObject(v) ? this.cloneObject(v) : this.isArray(v) ? this.cloneArray(v) : v;
  },
  cloneArray: function(a) {
    return this.mergeToArray([], a);
  },
  cloneObject: function(o) {
    return this.mergeToObject({}, o);
  },
  values: function(obj) {
    var arr = [];
    for (var k in obj) {
      arr.push(obj[k]);
    }
    return arr;
  },
  validate: function(type, obj) {
    if (!obj) return false;
    var err = 0;
    for (var k in type) {
      if (k === 'optional') continue;

      var isOpt = !!type.optional &&!!type.optional[k],
        hasProp = obj.hasOwnProperty(k),
        valType = this.asType(obj[k]),
        isModel = !obj['init'],
        isSet = true;

      if (valType === 'null' || valType === 'undefined'
          || (valType === 'number' && !isFinite(obj[k]))
          || (valType === 'string' && obj[k] === '')
         ) isSet = false;

      if (!isOpt && (!hasProp || !isSet)) ++err;

      if (isSet && isModel &&
        (util.isArray(obj[k]) && obj[k].length === 0)) ++err;

      if (isSet && !isModel && // model object Bid+Slot can have mixed types
        (util.asType(obj[k]) !== util.asType(type[k]))) ++err;

      if (err > 0) break;
    }
    return !err;
  }
};

/**
 * Randomize the position of items in a collection.
 * @see http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {array} collection
 * @return {Array}
 */
util.random = function(collection) {
  return collection.sort(function() {
    return .5 - Math.random();
  });
};

module.exports = util;
