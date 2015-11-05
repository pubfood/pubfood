food.observe('AUCTION_POST_RUN', function() {
  auctionProviderOne.cmd.push(function() {
    auctionProviderOne.display('div-rail');
  });
});
