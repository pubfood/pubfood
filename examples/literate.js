// # assumptions
//  you have googletag / dfp for your auctioneer
// and amazon and yieldbot for your bidders

// # use pubfood
// inline or load the pubfood code

// # setup globals

// ## auctioneer
// `googletag.cmd` setup in this example

// ## bidders
// `amznads` and `ybotq` in this example

// # setup pubfood

// make a local version of pubfood here called `pf`
var pf = new pubfood();

// # define slots
// for pubfood and say which bidders are in play per slot

// ## first slot

// is for a couple sizes and in play for both bidders
pf.addSlot({
  name: '/2476204/multi-size',
  elementId: 'div-multi-size',
  sizes: [[300, 250], [300, 600]],
  bidProviders: {
    amazon: {},
    yieldbot: {}
  }
});

// ## second slot

// is only in play for amazon
pf.addSlot({
  name: '/2476204/rail',
  elementId: 'div-rail',
  sizes: [[300, 250]],
  bidProviders: {
    amazon: {}
  }
});

// # define providers

// ## amazon

// here is how we say amazon is one of the bidders
pf.addBidProvider({
  name: 'amazon',
  libUri: 'http://c.amazon-adsystem.com/aax2/amzn_ads.js',
  // this function gets called once after the lib has loaded
  init: function(slots, options, next, done) {
    // here are the things you'll need to accomplish
    // * if amazon needs their own slot definitions do that here
    // * call amazon and right afterwards call `done()` to finish bid initialization
    // for amazon
    // * when amazon has the bids back call `next({ ... })` with the bid information.
    // it should look something like this once per bid on each slot
    // * if you have some first party data you want to send to amazon do it here
    /*
    you write code or copy existing code here
    ...
    done();
    ...
    next({
      slot: "..."
      value: ...,
      sizes: [...]
    });
    */
  }
});
// at this point the amazon bidder is defined and ready to be used in the auction

// ## yieldbot
// next we'll get yieldbot to be one of the bidders too
food.addBidProvider({
  name: 'yieldbot',
  libUri: 'http://cdn.yldbt.com/js/yieldbot.intent.js',
  init: function(slots, options, next, done) {
    // here are the things you'll need to accomplish
    // * if yieldbot needs their own slot definitions do that here
    // * call yieldbot and right afterwards call `done()` to finish bid initialization
    // for yieldbot
    // * when yieldbot has the bids back call `next({ ... })` with the bid information.
    // it should look something like this once per bid on each slot
    // * if you have some first party data you want to send to yieldbot do it here
    /*
    you write code or copy existing code here
    ...
    done();
    ...
    next({
      slot: "..."
      value: ...,
      sizes: [...]
    });
    */
  }
});
// now the yieldbot bidder is defined and ready to be used in the auction

// ## gpt / dfp

// next we'll get google in place as the auctioneer
pf.addAuctionProvider({
  name: 'google',
  libUri: 'http://www.googletagservices.com/tag/js/gpt.js',
  init: function(targets, options, done) {
    googletag.cmd.push(function() {
      /*
      you write code or copy existing code here looping over slots
      .setTargeting(...);
      */
    });

    googletag.cmd.push(function() {
      /*
      .enableServices();
      done();
      */
    });
  }
});
// now the google auctioneer is defined and ready to run the auction

// ## auction timeout, logging, and starting

// run the auction at 1.2 seconds even if some bidders are slower
pf.timeout(1200)

// simple console logging of events
pf.observe(function(ev) {
  console.log(ev);
});

// start pubfood giving basing time off of right now
pf.start(+new Date());

// ## in the page

// just display ads like normal
googletag.cmd.push(function() {
  googletag.display('div-multi-size');
  googletag.display('div-rail');
});
