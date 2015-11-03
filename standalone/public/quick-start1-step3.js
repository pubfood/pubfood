
 food.setAuctionProvider({
   name: 'auctionProviderOne',
   libUri: '/simulated-auction-provider/auctionProviderOne.js',
   init: function(targets, done) {
     auctionProviderOne.cmd.push(function() {
       var i, t;
       for (i = 0; i < targets.length; i++) {
         var target = targets[i];

         if(target.type === 'page'){
           // set page level targeting
           for(t in target.targeting){
             auctionProviderOne.setTargeting(t, target.targeting[t]);
           }
         }

         if(target.type === 'slot'){
           var apSlot = auctionProviderOne.defineSlot(target.name, target.sizes, target.elementId);

           // set slot level targeting
           for(t in target.targeting){
             apSlot.setTargeting(t, target.targeting[t]);
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
   refresh: function(slots, targets, done) {
   }
 });
