# Provider COMPLETE Events can be "Forced" by Pubfood
When a provider timeout fires before a provider is complete or an Error occurs during <code>init</code>, <code>refresh</code>, Pubfood
will call `done()` aka "force" the call on the provider.

The result of a Pubfood forced `done()` call will be the standard BID_COMPLETE and AUCTION_COMPLETE events, but with a [PubfoodEventAnnotation](http://pubfood.org/api-reference#typeDefs-PubfoodEventAnnotation) of type:

 - <code>[PubfoodEvent.ANNOTATION_TYPE.FORCED_DONE](http://pubfood.org/api-reference#PubfoodEvent-ANNOTATION_TYPE)</code>

## BID_COMPLETE and AUCTION_COMPLETE Event Annotations

### <em>Note:</em> Auction Type Annotation

Both the [BID_COMPLETE](http://pubfood.org/api-reference#PubfoodEvent-BID_COMPLETE) and [AUCTION_COMPLETE](http://pubfood.org/api-reference#PubfoodEvent-AUCTION_COMPLETE) events are general in that the event types themselves do not indicate if the COMPLETE event was for an `init` or `refresh` auction.

However, there is <code>[EventObject.annotations.auctionType](http://pubfood.org/api-reference#typeDefs-EventObject)</code> event annotation that provides this information. For example to identify if a `BID_COMPLETE` or `AUCTION_COMPLETE` event is for a `refresh` call you can check the annotations for the event as follows:

<pre>
     pf.observe('AUCTION_COMPLETE', function(event) {
       var auctionTypeAnnotation = event.annotations.auctionType;
       if (auctionTypeAnnotation && auctionTypeAnnotation.type === 'refresh' ) {
         console.log('### Refresh AUCTION_COMPLETE ###');
       }
     });
</pre>

<blockquote
<code>### Refresh AUCTION_COMPLETE ###</code>
</blockquote>

### Forced Done Annotation
A provider may be forced to COMPLETE for two reasons currently:

1. An Error occurred during `init` or `refresh` processing; or
2. The provider has not finished processing before the configured timeout occurs.

#### Forced Done by Error or Timeout
Both the `BID_COMPLETE` and `AUCTION_COMPLETE` events may hava `forcedDone` annotation and observers can check for the type as shown below.

##### `BID_COMPLETE`
<pre>
     pf.observe('BID_COMPLETE', function(event) {
       var forcedDoneAnnotation = event.annotations.forcedDone;
       var auctionType = event.annotations.auctionType.type;
       if (forcedDoneAnnotation) {
         console.log('BID_COMPLETE, Forced done (' + forcedDoneAnnotation.type + '): ' + event.data + '\n\t' + auctionType  + ', ' + forcedDoneAnnotation.message);
       } else {
         console.log('BID_COMPLETE, Success: ' + event.data + ' - ' + auctionType);
       }
     });
</pre>

<em>Output from the `BID_COMPLETE` handler</em>
<blockquote>
BID_COMPLETE, Forced done (error): mock1<br>
&nbsp;&nbsp;&nbsp;&nbsp;refresh, TestError-mock1-BidProvider<br>
BID_COMPLETE, Forced done (timeout): mock1<br>
&nbsp;&nbsp;&nbsp;&nbsp;init, The bid done callback for "mock1" hasn't been called within the allotted time (0.102sec)
</blockquote>

##### `AUCTION_COMPLETE`
<pre>
     pf.observe('AUCTION_COMPLETE', function(event) {
       var forcedDoneAnnotation = event.annotations.forcedDone;
       var auctionType = event.annotations.auctionType.type;
       if (forcedDoneAnnotation) {
         console.log('AUCTION_COMPLETE, Forced done (' + forcedDoneAnnotation.type + '): ' + event.data.name + '\n\t' + auctionType + ', ' + event.annotations.forcedDone.message);
       } else {
         console.log('AUCTION_COMPLETE, Success: ' + event.data.name + ' - ' + auctionType);
       }
     });
</pre>

<em>Output from the `AUCTION_COMPLETE` handler</em>
<blockquote>
AUCTION_COMPLETE, Forced done (error): Google<br>
&nbsp;&nbsp;&nbsp;&nbsp;refresh, TestError-Google-AuctionProvider<br>
AUCTION_COMPLETE, Success: Google - init
</blockquote>
