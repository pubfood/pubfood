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
 * @property {array} logCall.args The function arguments
 * @property {function} logEvent Logs every time a given event is emitted
 * @property {string} logEvent.name The event name
 * @property {array} logEvent.args The event arguments
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
      ts: (+new Date()),
      functionName: name,
      args: Array.prototype.slice.call(args)
    });
  },
  logEvent: function(name, args){
    this.history.push({
      ts: (+new Date()),
      eventName: name,
      args: Array.prototype.slice.call(args)
    });
  }
};

module.exports = logger;
