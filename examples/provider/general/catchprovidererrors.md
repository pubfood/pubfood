# Pubfood - Handling Provider Errors

In this example you will see how to errors that are raised in:

- Pubfood configuration when <code>pubfood.start(...)</code> is called
 - [pubfood](https://github.com/pubfood/pubfood/blob/master/src/pubfood.js)
- Provider <code>init</code> and <code>refresh</code> functions
 - <code>[AuctionProvider](https://github.com/pubfood/pubfood/blob/master/src/provider/auctionprovider.js)</code>
 - <code>[BidProvider](https://github.com/pubfood/pubfood/blob/master/src/provider/bidprovider.js)</code>

## Pubfood Configuration Errors
Use the [API Reference, apiStartCallback](http://pubfood.org/api-reference#typeDefs-apiStartCallback) argument of [pubfood.start()](http://pubfood.org/api-reference#pubfood-start) to respond to configuration errors.

<code>apiStartCallback(hasErrors, errors)</code>

Where;
 - <code>hasErrors</code> : true if configuration errors exist
 - <code>errors</code> : array of error messages

<pre>
     try {
         pf.start(Date.now(), function(hasErrors, errors) {
           if (hasErrors) {
             for (var idx in errors) {
               console.log('Error: ', errors[idx]);
             }
           }
         });
     } catch (err) {
         console.log('Caught: ' + err.message);
     }
</pre>

## Provider <code>init</code> and <code>refresh</code> Errors
Pubfood <code>[AuctionProvider](https://github.com/pubfood/pubfood/blob/master/src/provider/auctionprovider.js)</code> <code>[BidProvider](https://github.com/pubfood/pubfood/blob/master/src/provider/bidprovider.js)</code> `init` and `refresh` functions may produce an unwanted Error.

Pubfood catches provider errors by default and reports the [ERROR](http://pubfood.org/api-reference#PubfoodEvent-ERROR) event. This prevents the error disrupting processing of Pubfood itself and potentially your site implementation.

For example, the bid provider <code>mockProvider1</code> below intentionally throws an Error in each of `init` and `refresh`
<pre>
     var mockProvider1 = pf.addBidProvider({
         name: 'mock1',
         init: function(slots, pushBid, done) {
             throw new Error('TestError-mock1-BidProvider.init')
             done();
         },
         refresh: function(slots, pushBid, done) {
             throw new Error('TestError-mock1-BidProvider.refresh')
             done();
         }
     });
</pre>

By default, Pubfood will catch these Errors and continue processing, but will ensure that an [ERROR](http://pubfood.org/api-reference#PubfoodEvent-ERROR) event is raised so that it can be handled by the client where necessary as below.
<pre>
     pf.observe('ERROR', function(event) {
       console.log('ERROR, ', event.data);
     });
</pre>

Pubfood also allows you to toggle on/off the propogaton of Errors by exposing the interface:

 - <code>[pubfood.throwErrors(silent)](../../../src/pubfood.js#L459-L462)</code>

<pre>
      var pf = new pubfood();
      pf.throwErrors(true);
</pre>

With the `pf.throwErrors(true)` configuration, Errors raised by either <code>[AuctionProvider](https://github.com/pubfood/pubfood/blob/master/src/provider/auctionprovider.js)</code> <code>[BidProvider](https://github.com/pubfood/pubfood/blob/master/src/provider/bidprovider.js)</code> `init` and `refresh` functions should be caught and handled by your client code.

For example, the snippet below shows that `pf.start()` has no `try/catch` handler, yet the `init` function of the bid provider throws an Error: Pubfood catches and handles the Error as the default in this case.

However, before the `pf.refresh()` call, the default error handling in Pubfood is made to re-throw errors by using the API `pf.throwErrors(true)`.

Therefore, the `pf.refresh()` called is wrapped in a `try/catch` to ensure client processing is not disrupted by the bid provider Error.

<pre>
     pf.start(Date.now(), function(hasErrors, errors) {
       if (hasErrors) {
         for (var idx in errors) {
           console.log('pubfood.start(), Error: ', errors[idx]);
         }
       }
     });

     pf.throwErrors(true);
     try {
         pf.refresh();
     } catch (err) {
         console.log('With pf.throwErrors(true), we Caught: ' + err.message);
     }
</pre>

In both cases, an [ERROR](http://pubfood.org/api-reference#PubfoodEvent-ERROR) event is raised and can be actioned in an event handler as in the `pf.observe('ERROR', function(event) {...});` snippet above.
