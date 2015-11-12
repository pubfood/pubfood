/* global BidBuilder */
/*eslint no-unused-vars: 0*/

module.exports = {
  valid: [
    {
      sizes: [300, 250],
      slot: '1',
      value: 1
    },
    {
      targeting: {
      },
      sizes: [300, 250],
      slot: '/this/is/a/slot',
      value: '1'
    },
    {
      targeting: {
        yes: 'yes',
      },
      sizes: [[300, 600], [300, 250]],
      slot: '/this/is/a/slot',
      value: 1
    },
    {
      targeting: {
        no: 'no'
      },
      sizes: [[728, 90]],
      slot: '/this/is/a/slot',
      value: .2
    },
    {
      targeting: {
        yes: 'yes'
      },
      sizes: [300, 250],
      slot: '/this/is/a/slot',
      value: '1.75'
    }
  ],
  invalid: [
    {
      targeting: {
        yes: 'yes',
        no: 'no'
      },
      sizes: [],
      slot: '/this/is/a/slot',
      value: 1
    },
    {
      targeting: {
        yes: 'yes',
        no: 'no'
      },
      slot: '/this/is/a/slot',
      value: 1
    },
    {
      targeting: {
        yes: 'yes',
        no: 'no'
      },
      sizes: [300, 250],
      value: 1
    }
  ]
};
