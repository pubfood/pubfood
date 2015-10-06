var bid = {
  provider: 'yieldbot',
  slot: 'right-rail',
  dimensions: [
    [300,250]
  ],
  value: '3',
  type: Number
};


var bid = new BidBuilder().
    .provider('yieldbot')
    .slot('right-rail')
    .dimension(300,250)
    .value('3')
    .type(Number);

