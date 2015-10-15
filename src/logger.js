/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/**
 *
 * @type {Array}
 */
var history = [];

/**
 * console.logs the history
 * @return {undefined}
 */
var dumpLog = function(){
  if(console && console.log){
    for (var i = 0; i < history.length; i++) {
      console.log(history[i]);
    }
  }
};

/**
 * logs api calls
 *
 * @param {string} name
 * @param {array} args
 * @return {function}
 */
var logCall = function(name, args) {
  history.push({
    functionName: name,
    args: Array.prototype.slice.call(args)
  });
};

module.exports = {
  history: history,
  logCall: logCall,
  dumpLog: dumpLog
};
