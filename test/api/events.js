/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/
var assert = require('chai').assert;
var Event = require('../../src/event');
var logger = require('../../src/logger');
var util = require('../../src/util');

require('../common');
var pubfood = require('../../src/pubfood');

describe('Pubfood Events', function() {
  beforeEach(function() {
    Event.removeAllListeners();
  });

  it('should log a start event', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });
    pf.observe('PUBFOOD_API_START', function(event) {
      done();
    });
    pf.start();
  });

  it('should log an optional startTimestamp', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    var startTimestamp = Date.now();
    pf.observe('PUBFOOD_API_START', function(event) {
      assert.equal(event.ts, startTimestamp, 'should have the start timestamp supplied');
      done();
    });
    pf.start(startTimestamp);
  });

  it('should log a refresh event', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });
    pf.observe('PUBFOOD_API_REFRESH', function(event) {
      done();
    });
    pf.refresh();
  });

  it('should call AUCTION_POST_RUN listeners registered after event emitted', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    pf.start();

    var isDone = false;
    pf.observe('AUCTION_POST_RUN', function(event) {
      isDone = true;
    });

    pf.observe('AUCTION_POST_RUN', function(event) {
      assert.equal(isDone, true, 'first observer should be done');
      done();
    });
  });

  it('should call AUCTION_POST_RUN observers once only', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    pf.start();

    var initIsDone = false;
    pf.observe('AUCTION_POST_RUN', function(event) {
      initIsDone = true;
    });

    pf.refresh();

    pf.observe('AUCTION_POST_RUN', function(event) {
      assert.equal(initIsDone, true, 'init auction should be complete');
      done();
    });
  });

  it('should allow AUCTION_POST_RUN observers to listen more than once', function(done) {
    var pf = new pubfood();
    pf.removeAllListeners('AUCTION_POST_RUN');
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    pf.start();

    var initIsDone = false;
    pf.observe('AUCTION_POST_RUN', function(event) {
      initIsDone = true;
    });

    pf.refresh();

    var observerCallCount = 0;
    pf.observe('AUCTION_POST_RUN', function(event) {
      observerCallCount++;
      if (initIsDone && observerCallCount === 2) {
        assert.equal(initIsDone, true, 'initIsDone is expected to be true');
        assert.equal(observerCallCount, 2, 'observer expected to be triggered for init and refresh');
        done();
      }
    }, -1);
  });

  it('should remove all event observers', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    pf.start();

    var initIsDone = false;
    pf.observe('AUCTION_POST_RUN', function(event) {
      initIsDone = true;
    });
    pf.removeAllListeners();

    pf.refresh();

    pf.observe('AUCTION_POST_RUN', function(event) {
      assert.equal(initIsDone, false, 'listener removal means initIsDone is expected to be false');
      done();
    });
  });

  it('should remove event observers by event name', function(done) {
    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    pf.start();

    var initIsDone = false;
    pf.observe('AUCTION_POST_RUN', function(event) {
      initIsDone = true;
    });
    pf.removeAllListeners('AUCTION_POST_RUN');

    pf.refresh();

    pf.observe('AUCTION_POST_RUN', function(event) {
      assert.equal(initIsDone, false, 'listener removal means initIsDone is expected to be false');
      done();
    });
  });

  it('should remove specific event observers', function(done) {
    var observerFlag = false;
    var observer = function(event) {
      observerFlag = true;
    };

    var pf = new pubfood();
    pf.addBidProvider({
      name: 'bp1',
      libUri: 'http://',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });
    pf.setAuctionProvider({
      name: 'ap1',
      libUri: 'http://',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });
    pf.addSlot({
      name: 'slot1',
      elementId: 'div1',
      sizes: [[1, 1]],
      bidProviders: ['bp1']
    });

    pf.start();

    var initIsDone = false;
    pf.observe('AUCTION_POST_RUN', function(event) {
      initIsDone = true;
    });

    pf.observe('AUCTION_POST_RUN', observer);
    pf.removeListener('AUCTION_POST_RUN', observer);

    pf.refresh();

    pf.observe('AUCTION_POST_RUN', function(event) {
      assert.equal(initIsDone, true, 'initIsDone is expected to be true');
      done();
    });
  });
});
