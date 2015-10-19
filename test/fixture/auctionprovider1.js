/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

/* global */
/*eslint no-unused-vars: 0*/

'use strict';

module.exports = {
  valid: [
    {
      name: 'Google',
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, options, done) {
      },
      refresh: function(slots, customTargeting, done) {
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
      refresh: function(slots, customTargeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      libUri: '//www.googletagservices.com/tag/js/gpt.js',
      init: function(slots, bids, options, done) {
      },
      refresh: function(slots, customTargeting, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    },
    {
      name: 'Google',
      init: function(slots, bids, options, done) {
      },
      refresh: function(slots, customTargeting, done) {
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
      init: function(slots, bids, options, done) {
      },
      trigger: function(done) {
        setTimeout(function() {
          done();
        }, 100);
      }
    }
  ]
};
