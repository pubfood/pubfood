window.PROVIDER_GLOBAL = window.PROVIDER_GLOBAL || {};
window.PROVIDER_GLOBAL.cmd = window.PROVIDER_GLOBAL.cmd || [];
(function() {
  'use strict';
  var _availability = '';
  var _initializing = false;
  var _initialized = false;
  var _cmdQ = PROVIDER_GLOBAL.cmd;

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
  PROVIDER_GLOBAL.init = function(queryParams) {
    if (_initializing || _initialized) {
      console.log('duplicate init call for PROVIDER_GLOBAL');
      return;
    }
    _initializing = true;
    var initURL = '/simulated-bid-provider/PROVIDER_GLOBAL/refresh?' + queryParams;
    // TODO consider window.document or just raw document instead
    var doc = window.document;
    // Note: currentScript is not generally available across browsers
    var cur = doc.currentScript;
    if ((PROVIDER_GLOBAL.useAsync || doc.readyState === 'complete' || doc.readyState === 'loaded' || cur && cur.async)) {
      // load async
      var script = doc.createElement('script');
      script.src = initURL;
      script.async = true;
      (doc.head || doc.body || doc.documentElement).appendChild(script);
      PROVIDER_GLOBAL._init_started = true;
    } else {
      // load sync
      var providerId = 'PROVIDER_GLOBAL-init-' + Math.random();
      try {
        doc.write('<script id="' + providerId + '" src="' + initURL + '"></script>');
      } catch (e) { }
      doc.getElementById(providerId) && (PROVIDER_GLOBAL._init_started = true);
    }
  };
  PROVIDER_GLOBAL.resume = function() {
    _initializing = false;
    _initialized = true;
    drainQ('resume drain');
  };
  PROVIDER_GLOBAL.setAvailable = function(availability) {
    _availability = availability;
  };
  PROVIDER_GLOBAL.getAvailable = function() {
    return _availability;
  };

  drainQ('initial drain');
  // allow pushing on more cmd callbacks
  PROVIDER_GLOBAL.cmd = {
    push: function() {
      _cmdQ = Array.prototype.slice.call(arguments);
      drainQ('cmd.push drain');
    }
  };
}());
