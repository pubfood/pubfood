food.addBidProvider({
   name: 'bidProviderOne',
   libUri: '/simulated-bid-provider/bidProviderOne.js',
   init: function(slots, pushBid, done) {
     bidProviderOne.cmd.push(function() {
       var encodedAvailability = encodeURIComponent('2476204-rail.650.300x250');
       bidProviderOne.init('delay=20&fuzz=10&availability=' + encodedAvailability);
     });
     bidProviderOne.cmd.push(function() {
       var getSize = function (raw) {
         var sizeSplit = raw.split('x');
         return [parseInt(sizeSplit[0], 10), parseInt(sizeSplit[1], 10)];
       };
       var parts = bidProviderOne.getAvailable().split('.');
       pushBid({
         slot: parts[0],
         value: parts[1],
         sizes: getSize(parts[2]),
         label: 'avg_price',
         targeting: {
           pvd1: 'targeting'
         }
       });
       done();
     });
   },
   refresh: function(slots, pushBid, done) {
   }
 });
