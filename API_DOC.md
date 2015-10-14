### Pubfood

```js
var p = new pubfood();

p.addTransformOperator(function(data){...});

p.addRequestOperator(function(data){...});

// add sidebar-unit slot
p.addSlot({name: '/2476204/sidebar-unit',...});

// add leaderboard slot
p.addSlot({name: '/2476204/leaderboard',...});

// set the Google as the auction provider
p.setAuctionProvider({name: 'Google',...});

// add bid provider - yieldbot
p.addBidProvider({name: 'Yieldbot',...});

// add bid prodider - Amazon
p.addBidProvider({name: 'Amazon',...});

// add custom reporter
p.addReporter(function(event){...});

p.start();
```