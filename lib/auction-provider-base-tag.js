/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

window.auctionProvider = window.auctionProvider || {};
window.auctionProvider.cmd = window.auctionProvider.cmd || [];

(function(api) {
  var _initialized = false;

  api.setTargeting = function(){

    return api;
  };

  api.addService = function(){

    return api;
  };

  api.defineSlot = function(){

    return api;
  };

  api.enableSingleRequest = function(){

    return api;
  };

  api.enableServices = function(){
    if(_initialized) {
      return;
    }
    _initialized = true;
  };

})(window.auctionProvider);
