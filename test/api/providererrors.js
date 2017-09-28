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
var PubfoodError = require('../../src/errors');

require('../common');
var pubfood = require('../../src/pubfood');

describe('Provider Error Handlers', function() {
  beforeEach(function() {
    Event.removeAllListeners();
  });
  it('should catch auction provider init errors', function(done) {
    try {
      var pf = new pubfood(),
        TEST_RETHROW_CAUGHT,
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT = false;

      pf.throwErrors(true);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        assert.equal(event.data, 'bidProvider', 'bidProvider should be done');
        TEST_BID_COMPLETE_CAUGHT = true;
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
        TEST_AUCTION_COMPLETE_CAUGHT = true;
        done();
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'Test - auctionProvider error', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          throw new Error('Test - auctionProvider error');
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          done();
        }
      });

      pf.start();
    } catch (err) {
      assert.equal(err.message, 'Test - auctionProvider error', 'should be the test error rethrown');
      TEST_RETHROW_CAUGHT = true;
    } finally {
      assert.equal(TEST_RETHROW_CAUGHT, true, 'auctionProvider error should have been rethrown');
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'auctionProvider error event should have been raised');
    }
  });

  it('should catch auction provider refresh errors', function(done) {
    try {
      var pf = new pubfood(),
        TEST_RETHROW_CAUGHT,
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT,
        TEST_AUCTION_START_EVENT = false;

      pf.throwErrors(true);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        if (TEST_AUCTION_START_EVENT) {
          assert.equal(event.data, 'bidProvider', 'bidProvider should be done');
          TEST_BID_COMPLETE_CAUGHT = true;
        }
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        if (TEST_AUCTION_START_EVENT) {
          assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
          TEST_AUCTION_COMPLETE_CAUGHT = true;
          done();
        }
        TEST_AUCTION_START_EVENT = true;
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'Test - auctionProvider error', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        },
        refresh: function(targeting, done) {
          throw new Error('Test - auctionProvider error');
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          done();
        },
        refresh: function(slots, pushBid, done) {
          done();
        }
      });

      pf.start();
      pf.refresh();
    } catch (err) {
      assert.equal(err.message, 'Test - auctionProvider error', 'should be the test error rethrown');
      TEST_RETHROW_CAUGHT = true;
    } finally {
      assert.equal(TEST_RETHROW_CAUGHT, true, 'auctionProvider error should have been rethrown');
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'auctionProvider error event should have been raised');
    }
  });

  it('should catch auction provider refresh errors, when bid provider refresh undefined', function(done) {
    try {
      var pf = new pubfood(),
        TEST_RETHROW_CAUGHT,
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT,
        TEST_AUCTION_START_EVENT = false;

      pf.throwErrors(true);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        if (event.annotations.auctionType && event.annotations.auctionType.type === 'init') {
          TEST_BID_COMPLETE_CAUGHT = true;
        }
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        if (event.annotations.auctionType && event.annotations.auctionType.type === 'refresh') {
          assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
          TEST_AUCTION_COMPLETE_CAUGHT = true;
          done();
        }
        TEST_AUCTION_START_EVENT = true;
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'Test - auctionProvider error', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        },
        refresh: function(targeting, done) {
          throw new Error('Test - auctionProvider error');
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          done();
        }
      });

      pf.start();
      pf.refresh();
    } catch (err) {
      assert.equal(err.message, 'Test - auctionProvider error', 'should be the test error rethrown');
      TEST_RETHROW_CAUGHT = true;
    } finally {
      assert.equal(TEST_RETHROW_CAUGHT, true, 'auctionProvider error should have been rethrown');
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'auctionProvider error event should have been raised');
    }
  });

  it('should catch bid provider init errors', function(done) {
    try {
      var pf = new pubfood(),
        TEST_RETHROW_CAUGHT,
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT = false;

      pf.throwErrors(true);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
        TEST_BID_COMPLETE_CAUGHT = true;
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        assert.equal(event.data.name, 'auctionProvider', 'auctionProvider should be done normally');
        TEST_AUCTION_COMPLETE_CAUGHT = true;
        done();
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'Test - bidProvider error', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        },
        refresh: function(targeting, done) {
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          throw new Error('Test - bidProvider error');
          done();
        },
        refresh: function(slots, pushBid, done) {
          done();
        }
      });


      pf.start();
      pf.refresh();
    } catch (err) {
      assert.equal(err.message, 'Test - bidProvider error', 'should be the test error rethrown');
      TEST_RETHROW_CAUGHT = true;
    } finally {
      assert.equal(TEST_RETHROW_CAUGHT, true, 'bidProvider error should have been rethrown');
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'bidProvider error event should have been raised');
    }
  });

  it('should catch bid provider refresh errors', function(done) {
    try {
      var pf = new pubfood(),
        TEST_RETHROW_CAUGHT,
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT,
        TEST_AUCTION_START_EVENT = false;

      pf.throwErrors(true);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        if (TEST_AUCTION_START_EVENT) {
          assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
          TEST_BID_COMPLETE_CAUGHT = true;
        }
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        assert.equal(event.data.name, 'auctionProvider', 'auctionProvider should be done normally');
        TEST_AUCTION_COMPLETE_CAUGHT = true;
        if (TEST_AUCTION_START_EVENT) {
          done();
        }
        TEST_AUCTION_START_EVENT = true;
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'Test - bidProvider error', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        },
        refresh: function(targeting, done) {
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          done();
        },
        refresh: function(slots, pushBid, done) {
          throw new Error('Test - bidProvider error');
          done();
        }
      });

      pf.start();
      pf.refresh();
    } catch (err) {
      assert.equal(err.message, 'Test - bidProvider error', 'should be the test error rethrown');
      TEST_RETHROW_CAUGHT = true;
    } finally {
      assert.equal(TEST_RETHROW_CAUGHT, true, 'bidProvider error should have been rethrown');
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'bidProvider error event should have been raised');
    }
  });

  it('should allow set throwErrors on bid provider only', function(done) {
    var pf = new pubfood(),
      otherAssertions = 0;
    pf.timeout(1);

    pf.observe('BID_COMPLETE', function(event) {
      if (event.annotations.auctionType.type === Event.ANNOTATION_TYPE.AUCTION_TYPE.REFRESH) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
        otherAssertions++;
      } else {
        assert.propertyVal(event.annotations.auctionType, 'type', Event.ANNOTATION_TYPE.AUCTION_TYPE.INIT);
        otherAssertions++;
      }
    });
    pf.observe('AUCTION_COMPLETE', function(event) {
      assert.equal(event.data.name, 'auctionProvider', 'auctionProvider should be done normally');
      if (event.annotations.auctionType.type === Event.ANNOTATION_TYPE.AUCTION_TYPE.REFRESH) {
        assert.equal(otherAssertions, 4, 'BID_COMPLETE and ERROR events should have been asserted');
        done();
      } else {
        assert.propertyVal(event.annotations.auctionType, 'type', Event.ANNOTATION_TYPE.AUCTION_TYPE.INIT);
        otherAssertions++;
      }
    });
    pf.observe('ERROR', function(event) {
      assert.equal(event.data.message, 'Test - bidProvider error', 'should be the test error');
      otherAssertions++;
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidProvider'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    var bidProvider =  pf.addBidProvider(      {
      name: 'bidProvider',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        throw new Error('Test - bidProvider error');
        done();
      }
    });

    pf.start();
    pf.refresh();
  });

  it('should allow set throwErrors on auction provider only', function(done) {
    var pf = new pubfood(),
      otherAssertions = 0;
    pf.timeout(1);

    pf.observe('BID_COMPLETE', function(event) {
      if (event.annotations.auctionType.type === Event.ANNOTATION_TYPE.AUCTION_TYPE.REFRESH) {
        assert.propertyVal(event.annotations.auctionType, 'type', Event.ANNOTATION_TYPE.AUCTION_TYPE.REFRESH);
        otherAssertions++;
      } else {
        assert.propertyVal(event.annotations.auctionType, 'type', Event.ANNOTATION_TYPE.AUCTION_TYPE.INIT);
        otherAssertions++;
      }
    });
    pf.observe('AUCTION_COMPLETE', function(event) {
      if (event.annotations.auctionType.type === Event.ANNOTATION_TYPE.AUCTION_TYPE.INIT) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
        otherAssertions++;
      } else {
        assert.equal(otherAssertions, 4, 'BID_COMPLETE, AUCTION_COMPLETE and ERROR events should have been asserted');
        done();
      }
    });
    pf.observe('ERROR', function(event) {
      assert.equal(event.data.message, 'Test - auctionProvider error', 'should be the test error');
      otherAssertions++;
    });

    pf.addSlot({
      name: '/00000000/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'bidProvider'
      ]
    });

    pf.setAuctionProvider({
      name: 'auctionProvider',
      libUri: 'fixture/lib.js',
      init: function(targeting, done) {
        throw new Error('Test - auctionProvider error');
        done();
      },
      refresh: function(targeting, done) {
        done();
      }
    });

    var bidProvider =  pf.addBidProvider(      {
      name: 'bidProvider',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    });

    pf.start();
    pf.refresh();
  });

  it('should report Error.message to pubfood ERROR event', function(done) {
    try {
      var pf = new pubfood(),
        TEST_RETHROW_CAUGHT,
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT,
        TEST_API_REFRESH = false;

      pf.throwErrors(true);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
        TEST_BID_COMPLETE_CAUGHT = true;
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        assert.equal(event.data.name, 'auctionProvider', 'auctionProvider should be done normally');
        TEST_AUCTION_COMPLETE_CAUGHT = true;
        done();
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'nought is not defined', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });
      pf.observe('PUBFOOD_API_REFRESH', function(event) {
        TEST_API_REFRESH = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        },
        refresh: function(targeting, done) {
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          var nada = nought;
          done();
        },
        refresh: function(slots, pushBid, done) {
          var nada = nought;
          done();
        }
      });

      pf.start();
      pf.refresh();
    } catch (err) {
      assert.equal(err.message, 'nought is not defined', 'should be the test error rethrown');
      TEST_RETHROW_CAUGHT = true;
    } finally {
      assert.equal(TEST_RETHROW_CAUGHT, true, 'bidProvider error should have been rethrown');
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'bidProvider error event should have been raised');
      assert.equal(TEST_API_REFRESH, false, 'pubfood refresh should have been skipped by error handling');
    }
  });

  it('should swallow Error with throwErrors(false), the default, but report Error.message to pubfood ERROR event', function(done) {
    try {
      var pf = new pubfood(),
        TEST_BID_COMPLETE_CAUGHT,
        TEST_AUCTION_COMPLETE_CAUGHT,
        TEST_ERROR_CAUGHT,
        TEST_API_REFRESH = false;

      pf.throwErrors(false);
      pf.timeout(1);

      pf.observe('BID_COMPLETE', function(event) {
        assert.propertyVal(event.annotations.forcedDone, 'type', Event.ANNOTATION_TYPE.FORCED_DONE.ERROR);
        TEST_BID_COMPLETE_CAUGHT = true;
      });
      pf.observe('AUCTION_COMPLETE', function(event) {
        assert.equal(event.data.name, 'auctionProvider', 'auctionProvider should be done normally');
        TEST_AUCTION_COMPLETE_CAUGHT = true;
        if (TEST_API_REFRESH) {
          done();
        }
      });
      pf.observe('ERROR', function(event) {
        assert.equal(event.data.message, 'nought is not defined', 'should be the test error');
        TEST_ERROR_CAUGHT = true;
      });
      pf.observe('PUBFOOD_API_REFRESH', function(event) {
        TEST_API_REFRESH = true;
      });

      pf.addSlot({
        name: '/00000000/multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        elementId: 'div-multi-size',
        bidProviders: [
          'bidProvider'
        ]
      });

      pf.setAuctionProvider({
        name: 'auctionProvider',
        libUri: 'fixture/lib.js',
        init: function(targeting, done) {
          done();
        },
        refresh: function(targeting, done) {
          done();
        }
      });

      pf.addBidProvider(      {
        name: 'bidProvider',
        init: function(slots, pushBid, done) {
          var nada = nought;
          done();
        },
        refresh: function(slots, pushBid, done) {
          var nada = nought;
          done();
        }
      });

      pf.start();
      pf.refresh();
    } finally {
      assert.equal(TEST_BID_COMPLETE_CAUGHT, true, 'bidProvider complete event should be raised');
      assert.equal(TEST_AUCTION_COMPLETE_CAUGHT, true, 'auctionProvider complete event should be raised');
      assert.equal(TEST_ERROR_CAUGHT, true, 'bidProvider error event should have been raised');
    }
  });
});
