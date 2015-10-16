/*global pubfood*/
/*eslint-disable */

var Rx = pubfood.library.Rx;

function X(x) {
  console.log('This is the callback: ' + x + ' : ' + +new Date());
  return true;
}

var lib = {
  exists: function(name, cb) {
    if (name) {
      cb(name);
    }
    return true;
  }
};

function requestBids(params, timeout, fn) {
  console.log('requestBids: ' + params + ' : ' + timeout + ' : Start: ' + +new Date());
  setTimeout(function() {
    return fn(params);
  }, timeout);
}

function request200(params, fn) {
  setTimeout(function() {
    return fn(params);
  }, 200);
}

function request500(params, fn) {
  setTimeout(function() {
    return fn(params);
  }, 500);
}

function request1000(params, fn) {
  setTimeout(function() {
    return fn(params);
  }, 1000);
}

Rx.config.useNativeEvents = true;

var bidder1 = Rx.Observable.create(function(observer) {
  setTimeout(function() {
    observer.onNext(42);
    observer.onCompleted();
    return function() {
      console.log('disposed');
    };
  }, 100);
});

var scheduler = Rx.Scheduler.default;

var getBids1000 = Rx.Observable.fromCallback(requestBids),
  getBids500 = Rx.Observable.fromCallback(requestBids),
  getBids200 = Rx.Observable.fromCallback(requestBids);

var getBids = Rx.Observable.concat(
  getBids1000('provider=amz&bid=1000', 1000),
  getBids500('provider=crit&bid=500', 500),
  getBids200('provider=yb&bid=200', 200)).toArray().timeout(1200, new Error('Timeout has occurred.'));

var mediator = Rx.Observable.timer;

var observer1 = Rx.Observer.create(
  function(x) {
    console.log('Observer1 Next:');
    console.log('Observer1 This is the callback: ' + x + ' : ' + +new Date());
  },
  function(err) {
    console.log('Observer1 Error: ' + err);
  },
  function() {
    console.log('Observer1 Completed');
  }
);

var observer2 = Rx.Observer.create(
  function(x) {
    console.log('Observer2 Next:');
    console.log('Observer2 This is the callback: ' + x + ' : ' + +new Date());
  },
  function(err) {
    console.log('Observer2 Error: ' + err);
  },
  function() {
    console.log('Observer2 Completed');
  }
);

var observer3 = Rx.Observer.create(
  function(x) {
    console.log('Observer3 Next:');
    console.log('Observer3 This is the callback: ' + x + ' : ' + +new Date());
  },
  function(err) {
    console.log('Observer3 Error: ' + err);
  },
  function() {
    console.log('Observer3 Completed');
  }
);

var sub2 = bidder1.subscribe(
  function(x) {
    console.log('Bidder1 Next: %s', x);
  },
  function(err) {
    console.log('Bidder1 Error: %s', err);
  },
  function() {
    console.log('Bidder1 Completed');
  }
);

var subscription1 = getBids.subscribe(observer1);
var subscription2 = getBids.subscribe(observer2);
var subscription3 = getBids.subscribe(observer3);

var fnObserver = Rx.Observable.create(function() {
  var intervalID = setInterval(function() {
    console.log('doing stuff');
  }, 100);
  setTimeout(function() {
    var done = Rx.Notification.createOnCompleted();
    done.accept(fnSubscription);
    clearInterval(intervalID);
    return true;
  }, 5000);
});

var fnSubscription = fnObserver.subscribe(
  function(x) {
    console.log('Next:');
    console.log('This is the callback: ' + x + ' : ' + +new Date());
  },
  function(err) {
    console.log('Error: ' + err);
  },
  function() {
    console.log('fnObserver Completed');
  });


function IFoo() {
}

IFoo.prototype = {
  hello: function() {

  },
  goodbye: function() {
    console.log('goodbye');
  }
};


var doFoo = new IFoo();

IFoo.prototype.hello = function() {
  console.log('hello bar');

};

IFoo.prototype.goodbye = function() {
  console.log('bar');
};

var doBar = new IFoo();