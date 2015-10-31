// setup pubfood and hook it up to providers
var food = new pubfood({ bidProviderCbTimeout: 3500 });
food.addSlot({
  name: '/2476204/rail',
  elementId: 'div-rail',
  sizes: [
    [300, 250]
  ],
  bidProviders: [
    'bidProviderOne'
  ]
});
