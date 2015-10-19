/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

window.PROVIDER_GLOBAL = window.PROVIDER_GLOBAL || {};
window.PROVIDER_GLOBAL.cmd = window.PROVIDER_GLOBAL.cmd || [];

(function(api) {
  var _initializing = false;
  var _initialized = false;
  var _cmdQ = api.cmd;
  var _slots = [];
  var _singleRequest = false;

  /**
   * create a new slot object
   * @param {string} name
   * @param {array.<number, number>} sizes
   * @param {string} elementId
   * @private
   * @return {_slot}
   */
  var _slot = function(name, sizes, elementId){
    this.name = name;
    this.sizes = sizes;
    this.element = elementId;
    this.targeting = [];
  };

  /**
   * set target on the slot
   * @param {string} key
   * @param {string|number} val
   * @return {_slot}
   */
  _slot.prototype.setTargeting = function(key, val){
    this.targeting.push([key, val]);
    return this;
  };

  /**
   * drain the queue
   *
   * @param reasonToDrain
   * @return {undefined}
   */
  var drainQ = function(reasonToDrain) {
    var i;
    var len = _cmdQ.length;
    var stopEarly = false;
    // console.log('reasonToDrain', reasonToDrain);
    if (_initializing) {
      // console.log('currently initializing so preventing reasonToDrain', reasonToDrain);
      return;
    }
    for (i = 0; i < len; i++) {
      _cmdQ[i]();
      if (_initializing) {
        stopEarly = true;
        break;
      }
    }
    if (stopEarly) {
      _cmdQ = _cmdQ.slice(i + 1);
    } else {
      _cmdQ = [];
    }
  };

  drainQ('initial drain');

  /**
   * allow pushing on more cmd callbacks
   * @type {{push: Function}}
   */
  api.cmd = {
    push: function() {
      if (_initializing) {
        _cmdQ = _cmdQ.concat(Array.prototype.slice.call(arguments));
        drainQ('cmd.push delay');
      } else {
        _cmdQ = Array.prototype.slice.call(arguments);
        drainQ('cmd.push drain');
      }
    }
  };

  /**
   * define a slot
   *
   * @param {string} slotName
   * @param {array.<number, number>} sizes
   * @param {string} elementId
   * @return {_slot}
   */
  api.defineSlot = function(slotName, sizes, elementId) {
    var slot = new _slot(slotName, sizes, elementId);
    _slots.push(slot);
    return slot;
  };

  /**
   * set targeting on all slots
   *
   * @param {string} key
   * @param {string|number} val
   * @return {api}
   */
  api.setTargeting = function(key, val) {
    var i;
    for (i = 0; i < _slots.length; i++) {
      _slots[i].setTargeting(key, val);
    }
    return api;
  };

  api.enableSingleRequest = function() {
    _singleRequest = true;
    return api;
  };

  api.enableServices = function() {
    if (_initializing || _initialized) {
      return;
    }
    _initializing = true;
    // iterate _slots and serialize the name, size and targeting for each one
    // later do page level targeting too and build the queryParms from all this
    var queryParams = 'foo=bar';
    var src = '/simulated-auction-provider/PROVIDER_GLOBAL/enable?' + queryParams;
    // load async
    // TODO consider window.document or just raw document instead
    var doc = window.document;
    var script = doc.createElement('script');
    script.src = src;
    script.async = true;
    (doc.head || doc.body || doc.documentElement).appendChild(script);
  };
  api.resume = function() {
    _initializing = false;
    _initialized = true;
    drainQ('resume drain');
  };

  api.display = function(divId) {
    var div = document.getElementById(divId);
    var i;
    var slot;
    for (i = 0; i < _slots.length; i++) {
      if (_slots[i].element === divId) {
        slot = _slots[i];
      }
    }
    if (div && slot && slot.contents) {
      div.innerHTML = slot.contents;
    } else {
      console.log('cannot display on', divId);
    }
  };

  api.fillSlot = function(divId, size, contents) {
    var i;
    for (i = 0; i < _slots.length; i++) {
      if (_slots[i].element === divId) {
        _slots[i].contents = contents;
        _slots[i].size = size;
        console.log(_slots[i]);
      }
    }
  };

})(window.PROVIDER_GLOBAL);
