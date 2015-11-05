window.PROVIDER_GLOBAL = window.PROVIDER_GLOBAL || {};
window.PROVIDER_GLOBAL.cmd = window.PROVIDER_GLOBAL.cmd || [];
(function(api, enc) {
  'use strict';
  var _initializing = false;
  var _initialized = false;
  var _cmdQ = api.cmd;
  var _slots = [];
  var _singleRequest = false;

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
  var _map = function(cb, arr) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
      res[i] = cb(arr[i]);
    }
    return res;
  };
  var _pluck = function(key, arr) {
    return _map(function (obj) {
      return obj[key];
    }, arr);
  };

  var _slot = function(name, sizes, elementId) {
    this.name = name;
    this.sizes = sizes;
    this.element = elementId;
    this.targeting = [];
  };
  _slot.prototype.setTargeting = function(key, val) {
    this.targeting.push([key, val]);
    return this;
  };

  api.defineSlot = function(slotName, sizes, elementId) {
    var slot = new _slot(slotName, sizes, elementId);
    _slots.push(slot);
    return slot;
  };
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
    var ORDERED_DELIMITER = '|';
    var SIZE_DELIMITER = ',';
    var KEY_VALUE_PAIR_DELIMITER = '&';
    var slotsEncoded = _map(function (s) {
      return {
        encodedSizes: _map(function (d) {
          return enc(d[0] + 'x' + d[1]);
        }, s.sizes).join(SIZE_DELIMITER),
        encodedTargeting: _map(function (d) {
          return enc(d[0]) + '=' + enc(d[1]);
        }, s.targeting).join(KEY_VALUE_PAIR_DELIMITER),
        encodedElId: enc(s.element),
        encodedName: enc(s.name)
      };
    }, _slots);
    var nameParam = 'name=' + enc(_pluck('encodedName', slotsEncoded).join(ORDERED_DELIMITER));
    var elIdParam = 'elid=' + enc(_pluck('encodedElId', slotsEncoded).join(ORDERED_DELIMITER));
    var sizeParam = 'size=' + enc(_pluck('encodedSizes', slotsEncoded).join(ORDERED_DELIMITER));
    var targetingParam = 'target=' + enc(_pluck('encodedTargeting', slotsEncoded).join(ORDERED_DELIMITER));
    // TODO figure out page level targeting
    var queryParams = [nameParam, elIdParam, sizeParam, targetingParam].join(KEY_VALUE_PAIR_DELIMITER);
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
      }
    }
  };

  drainQ('initial drain');
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
})(window.PROVIDER_GLOBAL, window.encodeURIComponent);
