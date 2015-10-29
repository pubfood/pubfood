### Pubfood

```js
var pf = new pubfood();

pf.addBidTransform(function(bids){...});

pf.addRequestTransform(function(slots){...});

// add sidebar-unit slot
pf.addSlot({name: '/2476204/sidebar-unit',...});

// add leaderboard slot
pf.addSlot({name: '/2476204/leaderboard',...});

// set the Google as the auction provider
pf.setAuctionProvider({name: 'Google',...});

// add bid provider - yieldbot
pf.addBidProvider({name: 'Yieldbot',...});

// add bid prodider - Amazon
pf.addBidProvider({name: 'Amazon',...});

// add custom reporter
pf.observe(function(event){...});

var now = +(new Date());

pf.start(now, function(hasErrors, details){
  if(hasErrors){
    // console.log('error details', details);
  } else {
    // no errors
  }
});
```