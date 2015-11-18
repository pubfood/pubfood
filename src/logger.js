/**
 * pubfood
 */

'use strict';

/**
 * @memberof pubfood
 * @property {array} history Store the logs
 * @property {function} dumpLog console.logs the history
 * @property {function} logCall Logs every time a given function is called
 * @property {string} logCall.name The function name
 * @property {array} logCall.args The function arguments
 * @property {function} logEvent Logs every time a given event is emitted
 * @property {string} logEvent.name The event name
 * @property {array} logEvent.args The event arguments
 * @private
 */
var logger = {
  auction: 1,
  history: [],
  dumpLog: function(type) {
    if (console && console.log) {
      for (var i = 0; i < this.history.length; i++) {
        var log = this.history[i];
        if(type){
          type = type || '';
          if(type.match(/event/) && log.eventName) {
            console.log(log);
          }
        } else {
          console.log(log);
        }
      }
    }
  },
  logCall: function(name, args) {
    this.history.push({
      ts: (+new Date()),
      auction: this.auction,
      functionName: name,
      args: Array.prototype.slice.call(args)
    });
  },
  logEvent: function(name, args){
    this.history.push({
      ts: (+new Date()),
      auction: this.auction,
      eventName: name,
      args: Array.prototype.slice.call(args)
    });
  }
};

module.exports = logger;
