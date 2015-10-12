/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

/* global yieldbot */
/*eslint no-unused-vars: 0*/

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
        {
          provider: 'yieldbot',
          slot: 'sidebar' // yieldbot's slot name
        },
        {
          provider: 'walkathoon',
          slot: 'amz-left-adslot' // walkathoon's slot name
        }
      ]
    },
    {
      name: 'top-leaderboard',
      sizes: [
        [728, 90]
      ],
      elementId: 'div-frotzbar',
      bidProviders: [
        {
          provider: 'yieldbot',
          slot: 'sidebar' // yieldbot's slot name
        },
        {
          provider: 'walkathoon',
          slot: 'amz-left-adslot' // walkathoon's slot name
        },
        {
          provider: 'carsales',
          slot: 'crls-sl-af83b' // carsales's slot name
        }
      ]
    }
  ],
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
  bidProviders: [
    {
      name: 'yieldbot',
      options: {
        foo: 'bar'
      },
      libUri: '//cdn.yldbt.com/js/yieldbot.intent.js',
      init: function(slots, options, done) {
      },
      refresh: function(slots, options, done) {
      }
    },
    {
      name: 'carsales',
      load: function(options, callback) {
      },
      init: function(options, callback) {
      },
      fetch: function(options, callback) {
      },
      refresh: function(slots, options, callback) {
      }
    },
    {
      name: 'walkathon',
      load: function(options, callback) {
      },
      init: function(options, callback) {
      },
      fetch: function(options, callback) {
      },
      refresh: function(slots, options, callback) {
      }
    }
  ]
};
