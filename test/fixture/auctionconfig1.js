/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

/* global yieldbot */
/*eslint no-unused-vars: 0*/

'use strict';

var ybotq = ybotq || [];

var config = {
  slots: {
    'right-rail': {
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-mumblebar',
      bidProviders: [
        'yieldbot',
        'amazon'
      ]
    },
    'top-leaderboard': {
      sizes: [
        [728, 90]
      ],
      elementId: 'div-frotzbar',
      bidProviders: [
        'yieldbot',
        'amazon',
        'casale'
      ]
    }
  },
  auctionProviders: {
    dfp: {
      options: {
      },
      load: function(options, callback) {
      },
      init: function(options, callback) {
      },
      fetch: function(options, callback) {
      },
      refresh: function(slots, options, callback) {
      }
    }
  },
  bidProviders: {
    yieldbot: {
      options: {
        foo: 'bar'
      },
      load: function(options, callback) {
        var js = document.createElement('script');
        js.src = '//cdn.yldbt.com/js/yieldbot.intent.js';
        var node = document.getElementsByTagName('script')[0];
        node.parentNode.insertBefore(js, node);
        js.onload = callback; // raise timing event
      },
      init: function(slots, options, callback) {

        ybotq.push(function() {
          yieldbot.psn('1234');

          for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            yieldbot.defineSlot(slot.name, {
              sizes: slot.sizes
            });
          }
          yieldbot.enableAsync();
          yieldbot.go();
        });

      },
      fetch: function(slots, options, callback) {

        ybotq.push(function() {
          var i;
          var bidModels = [];

          var slots = yieldbot.getPageCriteria().split(','); //sidebar:300x250:800,test_slot:300x250:200
          for (i = 0; i < slots.length; i++) {
            var slotInfo = slots[i].split(':'); //sidebar:300x250:800
            var slot = slotInfo[0];
            var size = slotInfo[1];
            var bid = 0;
            if (slotInfo.length && slotInfo[2]) {
              bid = parseFloat(slotInfo[2], 10);
            }

            var sizes = size.split('x');
            sizes[0] = parseInt(sizes[0], 10);
            sizes[1] = parseInt(sizes[1], 10);

            bidModels.push({
              value: bid,
              slot: slot,
              dimensions: sizes
            });
          }

          // submit my bids...
          callback(bidModels);
        });
      },
      refresh: function(slots, options, callback) {

      }
    },
    carsales: {
      load: function(options, callback) {
      },
      init: function(options, callback) {
      },
      fetch: function(options, callback) {
      },
      refresh: function(slots, options, callback) {
      }
    },
    walkathon: {
      load: function(options, callback) {
      },
      init: function(options, callback) {
      },
      fetch: function(options, callback) {
      },
      refresh: function(slots, options, callback) {
      }
    }
  }
};
