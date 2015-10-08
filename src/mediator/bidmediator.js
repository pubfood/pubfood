/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var BidProvider = require('../provider/bidprovider');

/**
 * BidMediator mediates provider bid requests.
 *
 * @class
 * @memberof pubfood/mediator
 */
function BidMediator(config) {
  this.config = config || {};
}

BidMediator.prototype.init = function() {
  this.bidProviders = {};

  var loadCallback = function(e) {
    var scriptSrc = e && e.target && e.target.src || 'null';
    console.log('Loaded tag: ' + scriptSrc);
  };

  var initCallback = function(data) {
    console.log('Init data: ' + data);
  };

  for (var k in this.config.bidProviders) {
    var p = new BidProvider(this.config.bidProviders[k]);
    this.bidProviders[k] = p;

    p.load({}, loadCallback);
    p.init({}, initCallback);
  }
};

BidMediator.prototype.load = function() {

  var callback = function(e) {
    var scriptSrc = e && e.target && e.target.src || 'null';
    console.log('Loaded tag: ' + scriptSrc);
  };

  for (var k in this.bidProviders) {
    this.bidProviders[k].init(callback);
  }
};

BidMediator.prototype.requestBids = function() {

};

module.exports = BidMediator;
