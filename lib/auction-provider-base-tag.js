/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

window.auctionProvider = window.auctionProvider || {};
window.auctionProvider.cmd = window.auctionProvider.cmd || [];

(function(api) {
  var _initialized = false;
  var _cmdQ = api.cmd;

  var drainQ = function(reasonToDrain) {
    console.log('reasonToDrain', reasonToDrain);
    var i;
    for (i = 0; i < _cmdQ.length; i++) {
      _cmdQ[i]();
    }
    _cmdQ = [];
  };

  drainQ('initial drain');
  // allow pushing on more cmd callbacks
  api.cmd = {
    push: function() {
      _cmdQ = Array.prototype.slice.call(arguments);
      drainQ('cmd.push drain');
    }
  };

  api.setTargeting = function() {

    return api;
  };

  api.addService = function() {

    return api;
  };

  api.defineSlot = function() {

    return api;
  };

  api.enableSingleRequest = function() {

    return api;
  };

  api.enableServices = function() {
    if (_initialized) {
      return;
    }
    _initialized = true;
  };

})(window.auctionProvider);
