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
  /**
   * Simple class extension/inheritance
   *
   * TODO: refactor to use?
   * - https://github.com/isaacs/inherits
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
  }
};

module.exports = util;
