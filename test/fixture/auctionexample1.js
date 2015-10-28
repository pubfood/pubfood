/**
 * pubfood
 */

/*eslint no-unused-vars: 0*/

'use strict';

var auctionexample1 = {
  slots: [
    {
      name: '/2476204/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: [
        'yieldbot',
        'bidderFast',
        'bidderSlow'
      ]
    }
  ],
  auctionProvider: {
    name: 'auctionProvider',
    libUri: '../test/fixture/lib.js',
    init: function(targets, options, done) {
    },
    refresh: function(targets, done) {
    },
    trigger: function(done) {
      setTimeout(function() {
        done();
      }, 100);
    }
  },
  bidProviders: [
    {
      name: 'yieldbot',
      libUri: '//cdn.yldbt.com/js/yieldbot.intent.js',
      init: function(slots, options, pushBid, done) {
      },
      refresh: function(slots, pushBid, done) {
      }
    },
    {
      name: 'bidderFast',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
      },
      refresh: function(slots, pushBid, done) {
      }
    },
    {
      name: 'bidderSlow',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
      },
      refresh: function(slots, pushBid, done) {
      }
    }
  ]
};

module.exports = auctionexample1;
