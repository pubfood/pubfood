/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

/* global yieldbot googletag*/
/*eslint no-unused-vars: 0*/

'use strict';

window.googletag = window.googletag || {};
googletag.cmd = googletag.cmd || [];
var ybotq = ybotq || [];

var pubfoodContrib = {
  slots: [
    {
      name: '/2476204/multi-size',
      sizes: [
        [300, 250],
        [300, 600]
      ],
      elementId: 'div-multi-size',
      bidProviders: {
        yieldbot: {
          slot: 'medrec' // yieldbot's slot name
        },
        walkathon: {
          slot: 'amz-left-adslot' // walkathoon's slot name
        }
      }
    },
    {
      name: '/2476204/leaderboard',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: {
        yieldbot: {
          slot: 'leaderboard', // yieldbot's slot name
        },
        walkathon: {
          slot: 'amz-top-adslot' // walkathoon's slot name
        },
        carsales: {
          slot: 'crls-sl-af83b' // carsales's slot name
        }
      }
    }
  ],
  auctionProvider: {
    options: {
    },
    name: 'Google',
    libUri: '//www.googletagservices.com/tag/js/gpt.js',
    init: function(targeting, options, done) {

      googletag.cmd.push(function() {
        console.log('there');
        var i;
        for (i = 0; i < targeting.length; i++) {
          var slot = targeting[i];

          var gptslot = googletag.defineSlot(slot.name, slot.sizes, slot.elementId)
              .addService(googletag.pubads());

          var bids = slot.bids || [];
          for (var j=0; j<bids.length; j++) {
            var bid = bids[j];
            if (bid.targeting && typeof bid.targeting === 'object') {
              for (var p in bid.targeting) {
                gptslot.setTargeting(p, bid.targeting[p]);
              }
            }
          }
          // Publisher sets their adserver targeting key vor the bid value here
          gptslot.setTargeting('bid', bid.value);
        }
      });
      googletag.cmd.push(function() {
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
        done();
      });

      googletag.cmd.push(function() { googletag.display('div-leaderboard'); });
      googletag.cmd.push(function() { googletag.display('div-multi-size'); });

    },
    refresh: function(targeting, options, done) {

      googletag.cmd.push(function() {
        googletag.refresh();
        done();
      });
    },
    trigger: function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    }
  },
  bidProviders: [
    {
      name: 'yieldbot',
      options: {
      },
      libUri: '//cdn.yldbt.com/js/yieldbot.intent.js',
      init: function(slots, options, pushBid, done) {

        var slotMap = {};
        ybotq.push(function() {
          yieldbot.psn('1234');

          for (var k in slots) {
            var slot = slots[k];
            /** @todo: should not need to reference oneself here */
            var providerSlotName = slot.bidProviders['yieldbot'].slot;

            yieldbot.defineSlot(providerSlotName, {
              sizes: slot.sizes
            });
            slotMap[providerSlotName] = k;
          }
          yieldbot.enableAsync();
          yieldbot.go();

        });

        ybotq.push(function() {
          var i;

          var pageSlots = yieldbot.getPageCriteria().split(','); //sidebar:300x250:800,test_slot:300x250:200
          for (i = 0; i < pageSlots.length; i++) {

            var slotInfo = pageSlots[i].split(':'); //sidebar:300x250:800
            var slot = slotInfo[0];
            var size = slotInfo[1];
            var bid = 0;
            if (slotInfo.length && slotInfo[2]) {
              bid = parseFloat(slotInfo[2], 10);
            }

            var sizes = size.split('x');
            sizes[0] = parseInt(sizes[0], 10);
            sizes[1] = parseInt(sizes[1], 10);

            // submit my bid...
            var bidObject = {
              slot: slotMap[slot] || 'undefined_slot',
              value: bid,
              sizes: sizes,
              targeting: {
                value: bid,
                ybot_ad: 'y',
                ybot_slot: slot
              }
            };
            pushBid(bidObject);
          }

          done();
        });
      },
      refresh: function(slots, options, done) {
      }
    },
    {
      name: 'carsales',
      libUri: '../test/fixture/lib.js',
      init: function(slots, options, pushBid, done) {
        done();
      },
      refresh: function(slots, options, pushBid, done) {
      }
    },
    {
      name: 'walkathon',
      options: { walk: 'athon'},
      libUri: '../test/fixture/lib.js',
      init: function(slots, options, pushBid, done) {
        done();
      },
      refresh: function(slots, options, pushBid, done) {
      }
    }
  ]
};
