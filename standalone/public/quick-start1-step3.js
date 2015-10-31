food.observe('AUCTION_POST_RUN', function(ev) {
  auctionProviderOne.cmd.push(function() {
    auctionProviderOne.display('div-rail');
  });
});
