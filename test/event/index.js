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
  it('should remove immediate listeners', function(done) {
    var spy = sinon.spy();

    Event.emit('hello'); // call-1
    Event.on('hello', spy); // hello listener 1
    sinon.assert.calledOnce(spy);

    Event.removeAllListeners();

    Event.emit('hello'); // call-2
    Event.on('hello', spy); // hello listener 1
    sinon.assert.calledTwice(spy);

    Event.emit('hello'); // call-3, call-4
    Event.on('hello', spy); // hello listener 2
    sinon.assert.callCount(spy, 4);

    done();
  });
  it('should invoke the done callback', function(done) {
    Event.on('hello', done);
    Event.emit('hello');
  });
  it('should invoke the done callback even if the emit happens first', function(done) {
    Event.emit('hello');
    Event.on('hello', done);
  });
  it.skip('should have event bus behavior', function(done) {
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
  it.skip('should allow multiple event bus listeners', function(done) {
    var firstListener = sinon.spy();
    var secondListener = sinon.spy();
    Event.emit('hello', 3);
    Event.on('hello', firstListener);
    Event.emit('hello', 4);
    Event.on('hello', secondListener);
    setTimeout(function() {
      sinon.assert.calledWithExactly(firstListener.getCall(0), 3);
      sinon.assert.calledWithExactly(firstListener.getCall(1), 4);
      sinon.assert.calledWithExactly(secondListener.getCall(0), 3);
      // sinon.assert.calledWithExactly(secondListener.getCall(1), 4);
      // NOTE this second event won't hit the second listener
      // TODO figure out if this even make sense?
      sinon.assert.calledTwice(firstListener);
      sinon.assert.calledOnce(secondListener);
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
      sinon.assert.calledWithExactly(secondListener.getCall(0), 5);
      sinon.assert.calledWithExactly(secondListener.getCall(1), 6);
      sinon.assert.calledWithExactly(thirdListener.getCall(0), 5);
      sinon.assert.calledWithExactly(thirdListener.getCall(1), 6);
      sinon.assert.calledWithExactly(thirdListener.getCall(2), 7);
      sinon.assert.calledOnce(firstListener);
      sinon.assert.calledTwice(secondListener);
      sinon.assert.calledThrice(thirdListener);
      done();
    }, 0);
  });
  it.skip('should deal carefully with AUCTION_POST_RUN', function(done) {
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
      sinon.assert.calledWithExactly(secondListener.getCall(0), 5);
      sinon.assert.calledWithExactly(secondListener.getCall(1), 6);
      sinon.assert.calledWithExactly(secondListener.getCall(2), 7);
      sinon.assert.calledWithExactly(thirdListener.getCall(0), 5);
      sinon.assert.calledWithExactly(thirdListener.getCall(1), 6);
      sinon.assert.calledWithExactly(thirdListener.getCall(2), 7);
      sinon.assert.calledThrice(firstListener);
      sinon.assert.calledThrice(secondListener);
      sinon.assert.calledThrice(thirdListener);
      done();
    }, 0);
  });
  it.skip('should exercise publish');
  it.skip('should consider pubfood.observe usage');
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
  it('should publish event annotations', function(done) {
    Event.publish('BID_COMPLETE', 'theBidder', {forcedDone: 'test'});
    Event.on('BID_COMPLETE', function(ev) {
      assert.equal(ev.annotations.forcedDone, 'test', 'forcedDone annotation should be \"test\"');
      done();
    });
  });
});
