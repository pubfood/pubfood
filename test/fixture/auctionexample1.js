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
    },
    {
      name: '/2476205/another-size',
      sizes: [
        [300, 250],
        [300, 450]
      ],
      elementId: 'div-another-size',
      bidProviders: [
      ]
    },
    {
      name: '/2476206/another',
      sizes: [
        [300, 250],
        [300, 450]
      ],
      elementId: 'div-another',
    }
  ],
  auctionProvider: {
    name: 'auctionProvider',
    libUri: '../test/fixture/lib.js',
    init: function(targeting, done) {
      done();
    },
    refresh: function(targeting, done) {
      done();
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
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    },
    {
      name: 'bidderFast',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    },
    {
      name: 'bidderSlow',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    }
  ]
};

module.exports = auctionexample1;
