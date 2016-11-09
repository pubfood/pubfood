# Yieldbot BidProvider - Sync Load
For those `BidProvider` implementations that require their [BidDelegate.libUri](http://pubfood.org/api-reference#typeDefs-BidDelegate) to be loaded synchronously, this can be achived by using the <code>[BidProvider.sync(true|false)](http://pubfood.org/api-reference#pubfood-provider-BidProvider-sync)</code> interface.
<pre>
var ybProvider = pf.addBidProvider({
    name: 'yieldbot',
    libUri: '//cdn.yldbt.com/js/yieldbot.intent.js',
    init: function(slots, pushBid, done) {
        ...
    },
    refresh: function(slots, pushBid, done) {
        ...
    }
});

<b>ybProvider.sync(true);</b>

pf.timeout(3000);
pf.start(Date.now(), function(hasErros, details) {
    if (hasErros) {
        console.log('HAS ERRORS', details);
    }
});
</pre>

While it is advisable that all third-party vendor scripts are loaded asynchronously, which is the default in Pubfood, it is occasionally necessary to load a library synchronously. A call to <code>[BidProvider.sync(true)](http://pubfood.org/api-reference#pubfood-provider-BidProvider-sync)</code> will tell Pubfood to load the provider library using `document.write` per the below snippet:

`document.write('<script src="' + scriptSrc + '">\x3C/script>');`

Where:

 - `scriptSrc` = the [BidDelegate.libUri](http://pubfood.org/api-reference#typeDefs-BidDelegate) property value