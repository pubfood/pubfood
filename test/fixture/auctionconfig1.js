/**
 * pubfood
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
      bidProviders: [
        'yieldbot',
        'walkathon'
      ]
    },
    {
      name: '/2476204/leaderboard',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-leaderboard',
      bidProviders: [
        'yieldbot',
        'walkathon',
        'carsales'
      ]
    }
  ],
  auctionProvider: {
    name: 'Google',
    libUri: '//www.googletagservices.com/tag/js/gpt.js',
    init: function(targeting, done) {
/* array of targeting objects
      {
        type: 'page',
        targeting: {
          yb_ad: 'y'
        }
      },
      {
        type: 'slot',
        name: '/2476204/multi-size',
        id: 'somerandomid',
        elementId: 'div-multi-size',
        sizes: [
          [300, 250],
          [300, 600]
        ],
        // a flattened list from all bidders
        targeting: {
          foo: ['bar', 'foo.bar'], // from bidder 1 & 2
          foooo: ['bar'], // from bidder 2
          provider1_bid: '400',
          provider2_bid: '200'
        },
        bids: [
          {
            provider: 'provider1',
            id: '1212121',
            targeting: {
              bid: '400',
              foo: 'bar'
            }
          }
        ]
      }
*/
      googletag.cmd.push(function() {
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
          //gptslot.setTargeting('bid', bid.value);
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
    refresh: function(targeting, done) {

      googletag.cmd.push(function() {
        googletag.refresh();
        done();
      });
    }
  },
  bidProviders: [
    {
      name: 'yieldbot',
      slotParams: {
        '/2476204/multi-size': 'medrec',
        '/2476204/leaderboard': 'leaderboard'
      },
      libUri: '//cdn.yldbt.com/js/yieldbot.intent.js',
      init: function(slots, pushBid, done) {

        /* Slot object
        {
          name: '/2476204/multi-size',
          sizes: [
            [300, 250],
            [300, 600]
          ],
          elementId: 'div-multi-size',
          params: {
            option1: 'use this for locality to the slot definition'
          }
        }
        */
        var slotMap = {};
        var slotParams = this.slotParams;
        ybotq.push(function() {
          yieldbot.psn('1234');

          for (var k = 0; k < slots.length; k++) {
            var slot = slots[k];
            var ybslot = slotParams[slot.name];

            yieldbot.defineSlot(ybslot, {
              sizes: slot.sizes
            });
            slotMap[ybslot] = slot.name;
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
                ybot_ad: 'y',
                ybot_slot: slot
              }
            };
            pushBid(bidObject);
          }

          done();
        });
      },
      refresh: function(slots, done) {
        done();
      }
    },
    {
      name: 'carsales',
      libUri: '../test/fixture/lib.js',
      init: function(slots, pushBid, done) {
        done();
      },
      refresh: function(slots, pushBid, done) {
        done();
      }
    },
    {
      name: 'walkathon',
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
