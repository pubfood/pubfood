/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/**
 * @type {object}
 * @name Logger
 * @property {array} history Store the logs
 * @property {function} dumpLog console.logs the history
 * @property {function} logCall Logs every time a given function is called
 * @property {string} logCall.name The function name
 * @property {array} logCall.args The function arguments to log
 */
var logger = {
  history: [],
  dumpLog: function() {
    if (console && console.log) {
      for (var i = 0; i < this.history.length; i++) {
        console.log(this.history[i]);
      }
    }
  },
  logCall: function(name, args) {
    this.history.push({
      functionName: name,
      args: Array.prototype.slice.call(args)
    });
  }
};

module.exports = logger;
