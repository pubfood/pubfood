food.setAuctionProvider({
  name: 'auctionProviderOne',
  libUri: '/simulated-auction-provider/auctionProviderOne.js',
  init: function(bids, done) {
    auctionProviderOne.cmd.push(function() {
      var i, key;
      for (i = 0; i < bids.length; i++) {
        var bid = bids[i];
        if (bid.type === 'page') {
          // set page level targeting
          for (key in bid.targeting) {
            auctionProviderOne.setTargeting(key, bid.targeting[key]);
          }
        }
        if (bid.type === 'slot') {
          var apSlot = auctionProviderOne.defineSlot(bid.name, bid.sizes, bid.elementId);
          // set slot level targeting
          for (key in bid.targeting) {
            apSlot.setTargeting(key, bid.targeting[key]);
          }
        }
      }
    });
    auctionProviderOne.cmd.push(function() {
      auctionProviderOne
        .enableSingleRequest()
        .enableServices();
    });
    done();
  },
  refresh: function(bids, done) {
  }
});
