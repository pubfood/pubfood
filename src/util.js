/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = {
  /**
   * The type of an {Object}.
   *
   * https://javascriptweblog.wordpress.com/2011/08/08/
   *         fixing-the-javascript-typeof-operator/
   *
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
  loadProviderTag: function(uri, action) {

    var scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.async = true;

    scriptEl.src = uri || '';

    if (scriptEl.src && action && typeof action === 'function') {
      scriptEl.onload = action;
    }
    var beforeEl = document.getElementsByTagName('head')[0] ||
        document.getElementsByTagName('body')[0] || null;
    if (beforeEl) {
      beforeEl.insertBefore(scriptEl, beforeEl.firstChild);
    }
  }
};

module.exports = util;
