/**
 * pubfood
 */
'use strict';

var sinon = require('sinon');
var Event = require('../../src/event');
var assert = require('chai').assert;

/*eslint no-undef: 0*/
describe('Event - Tests', function () {
  beforeEach(function() {
    Event.removeAllListeners();
  });
  it('should remove all listeners', function(done) {
    var spy = sinon.spy();

    Event.on('hello', spy); // hello listener 1
    Event.emit('hello', 1); // call-1
    sinon.assert.calledOnce(spy);

    Event.removeAllListeners();

    Event.on('hello', spy); // hello listener 1
    Event.emit('hello', 2); // call-2
    sinon.assert.calledTwice(spy);

    Event.on('hello', spy); // hello listener 2
    Event.emit('hello', 3); // call-3, call-4
    sinon.assert.callCount(spy, 4, 'listener should be called four times');

    done();
  });
  it('should remove all listeners when event argument supplied', function(done) {
    var spy = sinon.spy();

    Event.on('hello', spy); // hello listener 1
    Event.emit('hello', 1); // call-1
    sinon.assert.calledOnce(spy);

    Event.removeAllListeners('hello');

    Event.on('hello', spy); // hello listener 1
    Event.emit('hello', 2); // call-2
    sinon.assert.calledTwice(spy);

    Event.removeAllListeners(0);

    // Invert on/emit calls for immediate observer removal
    Event.emit('hello', 3); // call-3
    Event.on('hello', spy); // hello listener 1
    sinon.assert.calledThrice(spy);

    var foo;
    Event.removeAllListeners(foo);

    Event.emit('hello', 3); // call-4
    Event.on('hello', spy); // hello listener 1
    sinon.assert.callCount(spy, 4);

    done();
  });
  it('should remove all listeners of the specified event name', function(done) {
    var spyHello = sinon.spy();
    var spyGoodbye = sinon.spy();

    Event.on('hello', spyHello);
    Event.on('goodbye', spyGoodbye);

    assert.equal(Event.listeners('hello').length, 1, 'should be one hello listener');
    assert.equal(Event.listeners('goodbye').length, 1, 'should be one goodbye listener');

    Event.emit('hello', 1);
    Event.emit('goodbye', 1);
    sinon.assert.calledOnce(spyHello);
    sinon.assert.calledOnce(spyGoodbye);

    Event.removeAllListeners('goodbye');

    assert.equal(Event.listeners('hello').length, 1, 'should be one hello listener');
    assert.equal(Event.listeners('goodbye').length, 0, 'should be zero goodbye listeners');

    Event.emit('hello', 1);
    Event.emit('goodbye', 1);

    sinon.assert.calledTwice(spyHello);
    sinon.assert.calledOnce(spyGoodbye);

    done();
  });
  it('should remove immediate listeners', function(done) {
    var spy = sinon.spy();

    Event.emit('hello');
    Event.on('hello', spy);
    sinon.assert.calledOnce(spy);

    Event.emit('hello');
    sinon.assert.calledTwice(spy);

    Event.removeAllListeners();

    Event.emit('hello');
    sinon.assert.calledTwice(spy);

    Event.emit('hello');
    Event.on('hello', spy);
    sinon.assert.calledThrice(spy);

    done();
  });
  it('should remove immediate listeners of the specified event name', function(done) {
    var spyHello = sinon.spy();
    var spyGoodbye = sinon.spy();

    Event.emit('hello');
    Event.emit('goodbye');

    Event.on('hello', spyHello);
    Event.on('goodbye', spyGoodbye);

    sinon.assert.calledOnce(spyHello);
    sinon.assert.calledOnce(spyGoodbye);

    Event.emit('hello');
    Event.emit('goodbye');

    Event.removeAllListeners('hello');

    Event.on('hello', spyHello);

    sinon.assert.calledTwice(spyHello);
    sinon.assert.calledTwice(spyGoodbye);

    done();
  });
  it('should remove a specific listener', function(done) {
    var spyHello = sinon.spy();
    var spyGoodbye = sinon.spy();
    var spyGoodbye2 = sinon.spy();

    Event.on('hello', spyHello);
    Event.on('goodbye', spyGoodbye);
    Event.on('goodbye', spyGoodbye2);

    assert.equal(Event.listeners('hello').length, 1, 'should be one hello listener');
    assert.equal(Event.listeners('goodbye').length, 2, 'should be two goodbye listeners');

    Event.emit('hello', 1);
    Event.emit('goodbye', 1);
    sinon.assert.calledOnce(spyHello);
    sinon.assert.calledOnce(spyGoodbye);
    sinon.assert.calledOnce(spyGoodbye2);

    Event.removeListener('goodbye', spyGoodbye2);

    assert.equal(Event.listeners('hello').length, 1, 'should be one hello listener');
    assert.equal(Event.listeners('goodbye').length, 1, 'should be one goodbye listener');

    Event.emit('hello', 1);
    Event.emit('goodbye', 1);

    sinon.assert.calledTwice(spyHello);
    sinon.assert.calledTwice(spyGoodbye);
    sinon.assert.calledOnce(spyGoodbye2);

    done();
  });
  it('should observe events emitted before observers registered', function(done) {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var spy3 = sinon.spy();

    setTimeout(function() {
      Event.emit('foo');
    }, 0);

    Event.on('foo', spy1);
    Event.on('foo', spy2);
    Event.on('foo', spy3);

    Event.emit('foo');

    Event.on('foo', spy1);
    Event.on('foo', spy2);
    Event.on('foo', spy3);

    setTimeout(function(event) {
      sinon.assert.calledThrice(spy1);
      sinon.assert.calledThrice(spy2);
      sinon.assert.calledThrice(spy3);
      done();
    }, 0);
  });
  it('should observe events emitted async sparsely', function(done) {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var spy3 = sinon.spy();

    Event.on('foo', spy1);

    setTimeout(function() {
      Event.emit('foo');
    }, 0);

    Event.on('foo', spy2);

    setTimeout(function() {
      Event.emit('foo');
    }, 0);

    Event.on('foo', spy3);

    setTimeout(function(event) {
      sinon.assert.calledTwice(spy1);
      sinon.assert.calledTwice(spy2);
      sinon.assert.calledTwice(spy3);
      done();
    }, 0);
  });
  it('should invoke the done callback', function(done) {
    Event.on('hello', done);
    Event.emit('hello');
  });
  it('should invoke the done callback even if the emit happens first', function(done) {
    Event.emit('hello');
    Event.on('hello', done);
  });
  it('should have event bus behavior', function(done) {
    var spy = sinon.spy();
    Event.emit('hello', 1);
    Event.on('hello', spy);
    Event.emit('hello', 2);
    setTimeout(function() {
      sinon.assert.calledWithExactly(spy.getCall(0), 1);
      sinon.assert.calledWithExactly(spy.getCall(1), 2);
      sinon.assert.calledTwice(spy);
      done();
    }, 0);
  });
  it('should speak to current AUCTION_POST_RUN behavior', function(done) {
    var firstListener = sinon.spy();
    var secondListener = sinon.spy();
    var thirdListener = sinon.spy();
    Event.emit('AUCTION_POST_RUN', 5);
    Event.on('AUCTION_POST_RUN', firstListener);
    Event.emit('AUCTION_POST_RUN', 6);
    Event.on('AUCTION_POST_RUN', secondListener);
    Event.emit('AUCTION_POST_RUN', 7);
    Event.on('AUCTION_POST_RUN', thirdListener);
    setTimeout(function() {
      sinon.assert.calledWithExactly(firstListener.getCall(0), 5);
      sinon.assert.calledWithExactly(firstListener.getCall(1), 6);
      sinon.assert.calledWithExactly(firstListener.getCall(2), 7);
      sinon.assert.calledWithExactly(secondListener.getCall(0), 6);
      sinon.assert.calledWithExactly(secondListener.getCall(1), 7);
      sinon.assert.calledWithExactly(thirdListener.getCall(0), 7);
      sinon.assert.calledThrice(firstListener);
      sinon.assert.calledTwice(secondListener);
      sinon.assert.calledOnce(thirdListener);
      done();
    }, 0);
  });
  it('should have a default auctionId', function(done) {
    assert.match(Event.auctionId, /^pubfood:[0-9]+/, 'default auctionId should be \"pubfood:<Date.now()>\"');
    done();
  });
  it('should set an auctionId', function(done) {
    Event.setAuctionId('123');
    assert.equal(Event.auctionId, '123', 'auctionId should be the string \"123\"');
    Event.setAuctionId(456);
    assert.equal(Event.auctionId, 456, 'auctionId should be the number 456');
    done();
  });
  it('should publish event timestamp', function(done) {
    var timeRef = (+new Date());
    Event.on('BID_COMPLETE', function(ev) {
      assert.isAtLeast(ev.ts, timeRef, 'event timestamp should be less than or equal to timeRef');
      done();
    });
    Event.publish('BID_COMPLETE', 'theBidder');
  });
  it('should publish event type', function(done) {
    Event.on('BID_COMPLETE', function(ev) {
      assert.equal(ev.type, 'BID_COMPLETE', 'event type should be  \"BID_COMPLETE\"');
      done();
    });
    Event.publish('BID_COMPLETE', 'theBidder');
  });
  it('should publish event data', function(done) {
    Event.publish('BID_COMPLETE', 'theBidder');
    Event.on('BID_COMPLETE', function(ev) {
      assert.equal(ev.data, 'theBidder', 'bidder should be \"theBidder\"');
      done();
    });
  });
  it('should create a new event annotation', function(done) {
    var annotations = Event.newEventAnnotation('forcedDone', 'timeout', 'provided done was called due to timeout');
    assert.equal(annotations.forcedDone.type, 'timeout', 'forcedDone annotation should be \"timeout\"');
    assert.equal(annotations.forcedDone.message, 'provided done was called due to timeout', 'forcedDone \"timeout\" annotation message incorrect');
    done();
  });
  it('should create a new event annotation and add to existing object', function(done) {
    var annotations = {};
    Event.newEventAnnotation('forcedDone', 'timeout', 'provided done was called due to timeout', annotations);
    assert.equal(annotations.forcedDone.type, 'timeout', 'forcedDone annotation should be \"timeout\"');
    assert.equal(annotations.forcedDone.message, 'provided done was called due to timeout', 'forcedDone \"timeout\" annotation message incorrect');
    done();
  });
  it('should publish event annotations', function(done) {
    var annotations = {};
    Event.newEventAnnotation('forcedDone', 'error', 'provided done was called due to error', annotations);

    Event.publish('BID_COMPLETE', 'theBidder', annotations);
    Event.on('BID_COMPLETE', function(ev) {
      assert.equal(ev.annotations.forcedDone.type, 'error', 'forcedDone annotation should be \"error\"');
      assert.equal(ev.annotations.forcedDone.message, 'provided done was called due to error', 'forcedDone annotation message incorrect');
      done();
    });
  });
});
