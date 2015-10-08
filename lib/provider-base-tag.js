/* globals PROVIDER_GLOBAL */
/*eslint no-unused-vars: 0*/

window.PROVIDER_GLOBAL = window.PROVIDER_GLOBAL || {};
PROVIDER_GLOBAL.cmd = PROVIDER_GLOBAL.cmd || [];
(function() {
  var _availability = '';
  var _initializing = false;
  var _initialized = false;
  var _cmdQ = [];
  var drainQ = function(reasonToDrain) {
    var i;
    var len = _cmdQ.length;
    var stopEarly = false;
    // console.log(reasonToDrain);
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
    if (_initialized) {
      console.log('duplicate init call for PROVIDER_GLOBAL');
      return;
    }
    _initializing = true;
    var initURL = '/simulated-provider/PROVIDER_GLOBAL/refresh?' + queryParams;
    // TODO make this async ready
    window.document.write('<script src="' + initURL + '"></script>');
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
  _cmdQ = PROVIDER_GLOBAL.cmd;
  console.log();
  drainQ('initial drain');
  // allow pushing on more cmd callbacks
  PROVIDER_GLOBAL.cmd = {
    push: function() {
      _cmdQ = Array.prototype.slice.call(arguments);
      drainQ('cmd.push drain');
    }
  };
}());
