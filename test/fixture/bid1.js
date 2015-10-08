/* global BidBuilder */
/*eslint no-unused-vars: 0*/

var bid_1 = {
  provider: 'yieldbot',
  slot: 'right-rail',
  dimensions: [
    [300, 250]
  ],
  value: '3',
  type: Number
};


var bid_2 = new BidBuilder()
    .provider('yieldbot')
    .slot('right-rail')
    .dimension(300, 250)
    .value('3')
    .type(Number);

