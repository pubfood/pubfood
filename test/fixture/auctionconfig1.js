/**
 * pubfood_contrib
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

/* global yieldbot */

'use strict';

var ybotq = ybotq || [];

var config = {
  slots: [
    {
      name: 'right-rail',
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
    {
      name: 'top-leaderboard',
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
  ],
  bidProviders: {
    yieldbot: {
      options: {
        foo: 'bar'
      },
      init: function(options, callback) {
        var js = document.createElement('script');
        js.src = '//cdn.yldbt.com/js/yieldbot.intent.js';
        var node = document.getElementsByTagName('script')[0];
        node.parentNode.insertBefore(js, node);

        js.onload = callback;
      },
      refresh: function(optons, callback) {
        ybotq.push(function() {
          yieldbot.psn('1234');
          yieldbot.defineSlot('test_slot', {
            sizes: [
              [300, 250],
              [300, 450],
              [300, 600]
            ]
          });
          yieldbot.defineSlot('sidebar', {
            sizes: [
              [300, 250],
              [300, 600]
            ]
          });
          yieldbot.enableAsync();
          yieldbot.go();
        });

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
      }
    },
    casale: {
      load: function(callback) {

      },
      refresh: function(callback) {
        var structure = {
          //
        };
        callback(structure);
      }
    },
    amazon: {
      load: function(callback) {

      },
      refresh: function(callback) {
        var structure = {
          //
        };
        callback(structure);
      }
    }
  }
};


//fake pubfood library
function fakepubfood(c) {

  if (c.bidProviders) {
    for (var key in c.bidProviders) {
      var bp = c.bidProviders[key];
      if (typeof bp === 'function') {

        (function(provider) {
          bp(function(bidStructure) {

            // if bidStructure is an array
            if (bidStructure.hasOwnProperty('length')) {
              var j;
              for(j=0; j< bidStructure.length; j++){
                bidStructure[j].type = 'number';
                bidStructure[j].provider = provider;
              }
            }
            // if bidStructure is an object
            else if(typeof bidStructure === 'object'){
              bidStructure.type = 'number';
              bidStructure.provider = provider;
            }

            console.log('recieved bid from', provider, bidStructure);
          });
        }(key));

      }
    }
  }

  return {
    on: function(e, cb) {
      //
    }
  };
}

var p = new fakepubfood(config);
p.on('error', function(data) {

});
