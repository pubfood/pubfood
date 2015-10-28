/**
 * pubfood
 */

/* global */
/*eslint no-unused-vars: 0*/

'use strict';

module.exports = {
  valid: [
    {
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, done) {
      },
      refresh: function(slots, targeting, done) {
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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      refresh: function(slots, targeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
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
      name: 'Google',
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
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
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
