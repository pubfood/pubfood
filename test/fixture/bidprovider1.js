/**
 * pubfood
 */

/* global */
/*eslint no-unused-vars: 0*/

'use strict';

module.exports = {
  valid: [
    {
      name: 'bidder1',
      libUri: '//localhost/cdn/bidder1.js',
      init: function(slots, options, pushBid, done) {
      },
      refresh: function(slots, options, pushBid, done) {
      }
    },
    {
      name: 'bidder1',
      libUri: '//localhost/cdn/bidder1.js',
      init: function(slots, options, pushBid, done) {
      }
    }
  ],
  invalid: [
    {
      name: 'bidder1',
    },
    {
      name: 'bidder1',
      init: function(slots, options, pushBid, done) {
      }
    },
    {
      name: 'bidder1',
      libUri: '//localhost/cdn/bidder1.js',
      refresh: function(slots, options, pushBid, done) {
      }
    },
    {
      name: 'bidder1',
      init: function(slots, options, pushBid, done) {
      },
      refresh: function(slots, options, pushBid, done) {
      }
    },
    {
      init: function(slots, options, pushBid, done) {
      },
      refresh: function(slots, options, pushBid, done) {
      }
    }
  ]
};
