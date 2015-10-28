### Pubfood

```js
var p = new pubfood();

p.addBidTransform(function(bids){...});

p.addRequestTransform(function(slots){...});

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
p.observe(function(event){...});

p.start();
```