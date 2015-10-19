/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

window.PROVIDER_GLOBAL = window.PROVIDER_GLOBAL || {};
window.PROVIDER_GLOBAL.cmd = window.PROVIDER_GLOBAL.cmd || [];

(function(api) {
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
    console.log('reasonToDrain', reasonToDrain);
    var i;
    for (i = 0; i < _cmdQ.length; i++) {
      _cmdQ[i]();
    }
    _cmdQ = [];
  };

  drainQ('initial drain');

  /**
   * allow pushing on more cmd callbacks
   * @type {{push: Function}}
   */
  api.cmd = {
    push: function() {
      _cmdQ = Array.prototype.slice.call(arguments);
      drainQ('cmd.push drain');
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
    for(i=0; i<_slots.length; i++){
      _slots[i].setTargeting(key, val);
    }
    return api;
  };

  api.enableSingleRequest = function() {
    _singleRequest = true;
    return api;
  };

  api.enableServices = function() {
    if (_initialized) {
      return;
    }
    _initialized = true;
  };

  api.display = function(divId){
    var div = document.getElementById(divId);
    if(div){
      div.innerHTML = 'DISPLAY AD HERE!';
    }
  };

})(window.PROVIDER_GLOBAL);
