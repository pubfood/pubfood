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
      elementId: 'div-mumblebar',
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
      elementId: 'div-frotzbar',
      bidProviders: {
        yieldbot: {
          slot: 'leaderboard' // yieldbot's slot name
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
  auctionProviderOff: {
    name: 'dfp',
    libUri: '',
    options: {
    },
    init: function(slots, options, done) {
    },
    refresh: function(slots, options, done) {
    }
  },
  auctionProvider: {
    name: 'Google',
    libUri: '//www.googletagservices.com/tag/js/gpt.js',
    init: function(slots, bids, options, done) {
      var i;
      googletag.cmd.push(function() {
        for (i=0; i<slots.length; i++) {
          var slot = slots[i];

          var slotBids = bids.filter(function(bid) {
            return bid.slot === slot.name;
          });

          var gptslot = googletag.defineSlot(slot.name, slot.sizes, slot.elementId)
              .addService(googletag.pubads());


          for (var j=0; j<slotBids.length; j++) {
            var bid = slotBids[j];
            if (bid.customTargeting && typeof bid.customTargeting === 'object') {
              for (var p in bid.customTargeting) {
                gptslot.setTargeting(p, bid.customTargeting[p]);
              }
            }
          }
          gptslot.setTargeting(bid.label, bid.value);
        }
      });
      googletag.cmd.push(function() {
        googletag.pubads().enableSingleRequest();
        googletag.enableServices();
        done('dfp');
      });

      googletag.cmd.push(function() { googletag.display('div-frotzbar'); });
      googletag.cmd.push(function() { googletag.display('div-mumblebar'); });

    },
    refresh: function(slots, customTargeting, done) {

      googletag.cmd.push(function() {
        googletag.refresh();
        done();
      });
    }
  },
  bidProviders: [
    {
      name: 'yieldbot',
      options: {
        foo: 'bar'
      },
      libUri: '//cdn.yldbt.com/js/yieldbot.intent.js',
      init: function(slots, options, next, done) {

        var slotMap = {};
        ybotq.push(function() {
          yieldbot.psn('1234');

          for (var k in slots) {
            var slot = slots[k];
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
              label: 'cpm',
              value: bid,
              sizes: sizes,
              customTargeting: {ybot_ad: 'y', ybot_slot: slot},
              provider: 'yieldbot'
            };
            next(bidObject);
          }

          done('yieldbot');
        });
      },
      refresh: function(slots, options, done) {
      }
    },
    {
      name: 'carsales',
      libUri: '//cdn.carsales.com/lib.js',
      init: function(slots, options, next, done) {
        done('carsales');
      },
      refresh: function(slots, options, next, done) {
      }
    },
    {
      name: 'walkathon',
      options: { walk: 'athon'},
      libUri: '//cdn.walkathon.com/lib.js',
      init: function(slots, options, next, done) {
        done('walkathon');
      },
      refresh: function(slots, options, next, done) {
      }
    }
  ]
};
