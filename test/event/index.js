/**
 * pubfood
 */
'use strict';

var sinon = require('sinon');
var Event = require('../../src/event');

/*eslint no-undef: 0*/
describe('Event - Tests', function () {
  beforeEach(function() {
    Event.removeAllListeners();
  });
  it('should remove all listeners', function(done) {
    var spy = sinon.spy();
    Event.on('hello', spy);
    Event.emit('hello', 1);
    sinon.assert.called(spy, 'listener not called');

    Event.removeAllListeners();
    Event.emit('hello', 1);
    sinon.assert.calledOnce(spy, 'listener called more than once');

    Event.on('hello', spy);
    Event.emit('hello', 1);
    sinon.assert.calledTwice(spy, 'listener not called twice');

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
});
