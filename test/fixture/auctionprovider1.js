/**
 * pubfood
 */

/* global */
/*eslint no-unused-vars: 0*/

'use strict';

module.exports = {
  valid: [
    {
      name: 'provider1',
      libUri: 'fixture/lib.js',
      init: function(slots, bids, done) {
      },
      refresh: function(slots, targeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      name: 'provider1',
      libUri: 'fixture/lib.js',
      init: function(slots, bids, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    }
  ],
  invalid: [
    {
      name: 'provider2',
      libUri: 'fixture/lib.js',
      refresh: function(slots, targeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      libUri: 'fixture/lib.js',
      init: function(slots, bids, done) {
      },
      refresh: function(slots, targeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      name: 'provider3',
      init: function(slots, bids, done) {
      },
      refresh: function(slots, targeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      libUri: 'fixture/lib.js',
      init: function(slots, bids, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    }
  ]
};
