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
  history: [],
  dumpLog: function(type) {
    if (console && console.log) {
      var re;
      if (type) {
        re = new RegExp(type, 'g');
      }
      for (var i = 0; i < this.history.length; i++) {
        var log = this.history[i];
        if(re){
          re.lastIndex = 0;
          if(log.eventName && re.test(log.eventName)) {
            console.log(log);
          }
          if(log.functionName && re.test(log.functionName)) {
            console.log(log);
          }
        } else {
          console.log(log);
        }
      }
    }
  },
  logCall: function(name, auctionId, args) {
    this.history.push({
      ts: (+new Date()),
      auctionId: auctionId,
      functionName: name,
      args: Array.prototype.slice.call(args)
    });
  },
  logEvent: function(name, auctionId, event){
    this.history.push({
      ts: (+new Date()),
      auctionId: auctionId,
      eventName: name,
      event: event
    });
  }
};

module.exports = logger;
