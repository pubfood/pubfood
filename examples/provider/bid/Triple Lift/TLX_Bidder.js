
window.TLX = window.TLX || {};
window.TLX.cmd = window.TLX.cmd || [];
(function() {
    'use strict';
    var _availability = '';
    var _initializing = false;
    var _initialized = false;
    var _bids = [];
    var _cmdQ = TLX.cmd;

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
    TLX.init = function(slots) {
        if (_initializing || _initialized) {
            console.log('duplicate init call for bidProviderOne');
            return;
        }
        _initializing = true;
        var i;
        for (i = 0; i < slots.length; i++) {
            var slot = slots[i];
            // TODO consider window.document or just raw document instead
            // TODO fix size and look at how prebid gets the referrer
            var doc = window.document;
            var initURL = '//tlx.3lift.com/header/auction?callback=TLX.setBid&inv_code=' + slot.tlxInvCode + '&size=1x1&referrer=' + encodeURIComponent(doc.href) + '&callback_id=' + slot.name;
            // Note: currentScript is not generally available across browsers
            var cur = doc.currentScript;
            //if ((bidProviderOne.useAsync || doc.readyState === 'complete' || doc.readyState === 'loaded' || cur && cur.async)) {
            // load async
            var script = doc.createElement('script');
            script.src = initURL;
            script.async = true;
            (doc.head || doc.body || doc.documentElement).appendChild(script);
            TLX._init_started = true;
            /*} else {
	      // load sync
	      var providerId = 'bidProviderOne-init-' + Math.random();
	      try {
	        doc.write('<script id="' + providerId + '" src="' + initURL + '">\x3c/script>');
	      } catch (e) { }
	      doc.getElementById(providerId) && (bidProviderOne._init_started = true);
	    }*/
        }
    };
    TLX.resume = function() {
        _initializing = false;
        _initialized = true;
        drainQ('resume drain');
    };
    TLX.setAvailable = function(availability) {
        _availability = availability;
    };
    TLX.getAvailable = function() {
        return _availability;
    };
    TLX.getResults = function() {
        return _bids;
    }
    TLX.setBid = function(bid) {
        _bids.push(bid);

    }

    drainQ('initial drain');
    // allow pushing on more cmd callbacks
    TLX.cmd = {
        push: function() {
            _cmdQ = Array.prototype.slice.call(arguments);
            drainQ('cmd.push drain');
        }
    };
}()); 