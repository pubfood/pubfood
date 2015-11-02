         food.addBidProvider({
            name: 'bidProviderOne',
            libUri: '/simulated-bid-provider/bidProviderOne.js',
            slotParams: {
              '/2476204/rail': 'rail'
            },
            sync: false,
            init: function(slots, pushBid, done) {
              bidProviderOne.cmd.push(function() {
                var encodedAvailability = encodeURIComponent('rail:300x250:650');
                bidProviderOne.init('delay=20&fuzz=10&availability=' + encodedAvailability);
              });
              var params = this.slotParams;
              bidProviderOne.cmd.push(function() {
                var i;
                var slotMap = {};
                for (var k = 0; k < slots.length; k++) {
                  var slot = slots[k];
                  var ybslot = params[slot.name];
                  slotMap[ybslot] = slot.name;
                }
                var getSizes = function (raw) {
                  var i;
                  var sizeSplit;
                  var sizes = [];
                  var sizesRaw = raw.split('|');
                  for (i = 0; i < sizesRaw.length; i++) {
                    sizeSplit = sizesRaw[i].split('x');
                    sizes[i] = [parseInt(sizeSplit[0], 10), parseInt(sizeSplit[1], 10)];
                  }
                  return sizes;
                };
                var parts;
                var availableSlots = bidProviderOne.getAvailable().split(',');
                for (i = 0; i < availableSlots.length; i++) {
                  parts = availableSlots[i].split(':');
                  // TODO consider different bids for different sizes
                  pushBid({
                      slot: slotMap[parts[0]],
                      value: parts[2],
                      sizes: getSizes(parts[1]),
                      label: 'avg_price',
                      targeting: {
                          pvd1: 'targeting'
                      }
                  });
                }
                console.log('bidProviderOne available:', bidProviderOne.getAvailable());
                done();
              });
            },
            refresh: function(slots, pushBid, done) {
            }
          });
