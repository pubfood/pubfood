# Pubfood - Google Analytics Ex1

In this example you will see how to produce the Google Analytics report views below:

**1). Bidder Name by Ad Unit**
![Bidder Name by Ad Unit](bidder-adunit.png?raw=true "GA User Timings Secondary Dimension")

**2). Bidder Name by Device Category**
![Bidder Name by Device](bidder-device.png?raw=true "GA User Timings Secondary Dimension")

**3). Bidder Name by Bid Value**
![Bidder Name by Bid Value](bidder-value.png?raw=true "GA User Timings Secondary Dimension")

## Report Terms
The reports above show bidder latency for a hypothetical publisher. This publisher is assumed to be interested in the following business terms:

Attribute Name | Attribute Type | Notes
---------------|----------------|------
Latency | Metric | A derived elapsed time.
Bidder Name | Dimension | This is the top level reporting group (Category) in Google Analytics.
Bid Value | Dimension | Depending on the bidder, may not numeric and when is, can be of different scale across bidders.
Ad Unit | Dimension | The DFP ad unit name.
Site Section | Dimension | GA, “Behavior->Page Path” or publisher custom dimension/variable.
Device Type | Dimension | GA, “Users->Device Category”.

## Google Analytics Integration
To produce the latency reports we take advantage of [User Timings](https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings) to capture the latency between certain Pubfood events.

In this section we will illustrate the Pubfood code required to send Google Analytics timing hits for the following table of attributes:

Attribute | Pubfood/Browser Source| GA Target
----------|-------------------|--------------------
Latency | <code>[PubfoodEvent.EVENT_TYPE](http://pubfood.org/api-reference#PubfoodEvent-EVENT_TYPE)</code><br><code>BID_COMPLETE - PUBFOOD_API_START</code> <br>OR<br><code>BID_PUSH_NEXT - PUBFOOD_API_START</code> <br><code>BID_PUSH_NEXT_LATE - PUBFOOD_API_START</code> | [timingValue](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#timingValue)
BidderName | PubfoodEvent.data.provider | [timingCategory](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#timingCategory)
BidValue | PubfoodEvent.data.value | [timingLabel](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#timingLabel)
AdUnit | PubfoodEvent.data.slot | [timingVar](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#timingVary)
SiteSection | document.location | [location](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#location) (default GA report attribute)
DeviceType | window.navigator.userAgent | [user-agent](https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.43) (default GA report attribute)

To send the Google Analytics user timings hits we will the `ga` function call as follows:
```
ga('send', 'timing',
     [timingCategory], [timingVar], [timingValue], [timingLabel]
)
```

Where:
 - `timingCategory=PubfoodEvent.data.provider`
 - `timingVar=PubfoodEvent.data.slot`
 - `timingValue=BID_COMPLETE - PUBFOOD_API_START (calculated latency)`
 - `timingLabel=PubfoodEvent.data.value | PubfoodEvent.data.targeting`

## To Send Google Analytics Timing Hits
## Important Considerations
#### Prevent skewing your tracking data
Setting breakpoints and performing other test/debug operations on your live site can skew User Timing and other Google Analytics event data. You cannot purge unwanted events that impact your data.

To limit the impact to production business intelligence reports it is advisable to:

**a).** when testing/debugging annotate bidder names with a prefix or suffix to allow easy [Report and View Filtering](https://support.google.com/analytics/answer/1033162) of events; and/or<br>
**b).** use a [Tracking Code](https://support.google.com/analytics/answer/1008080?hl=en) specifically for test/debug activities.

### 0. Example Code
*The following snippets are implemented in the example file [ga-ex1.html](ga-ex1.html)*
### 1. Define functions to build event data and send the GA `timing` hit

See [ga-ex1.html](https://github.com/search?q=path%3Aexamples%2Fanalytics%2Fga+extension%3Ahtml+buildHit&ref=searchresults&type=Code "Google Analytics - Ex1")
```
     function buildHit(ev, timeRef) {
         ...
     }
```
See [ga-ex1.html](https://github.com/search?q=path%3Aexamples%2Fanalytics%2Fga+extension%3Ahtml+sendHit&ref=searchresults&type=Code "Google Analytics - Ex1")
```
     function sendHit(hit) {
         ga('pftest.send', {
             hitType: 'timing',
             timingCategory: hit.category,
             timingVar: hit.timingVar,
             timingValue: hit.timingValue,
             timingLabel: hit.timingLabel
         });
     }
```
***Before*** the Pubfood process is started i.e. `pf.start();` add the following Pubfood event observers:
### 2. Register observer for Bid events
#### `BID_PUSH_NEXT`
See
[ga-ex1.html](https://github.com/search?q=path%3Aexamples%2Fanalytics%2Fga+extension%3Ahtml+%22pf.observe%20BID_PUSH_NEXT%22&ref=searchresults&type=Code "Google Analytics - Ex1")
```
     pf.observe('BID_PUSH_NEXT', function(ev) {
         var hit = buildHit(ev, pfTimeReference);
         if (hit) {
             sendHit(hit);
         };
     });
```

### 3. Register observer for Bid events that come after the Pubfood timeout
#### `BID_PUSH_NEXT_LATE`
See [ga-ex1.html](https://github.com/search?q=path%3Aexamples%2Fanalytics%2Fga+extension%3Ahtml+%22pf.observe%20BID_PUSH_NEXT_LATE%22&ref=searchresults&type=Code "Google Analytics - Ex1")
```
     pf.observe('BID_PUSH_NEXT_LATE', function(ev) {
         var hit = buildHit(ev, pfTimeReference);
         if (hit) {
             console.log(JSON.stringify(hit));
             sendHit(hit);
         };
     });
````

### 4. Register observer for the bid provider is finished with bids
#### `BID_COMPLETE`
See
[ga-ex1.html](https://github.com/search?q=path%3Aexamples%2Fanalytics%2Fga+extension%3Ahtml+%22pf.observe%20BID_COMPLETE%22&ref=searchresults&type=Code "Google Analytics - Ex1")
```
     pf.observe('BID_COMPLETE', function(ev) {
         var hit = buildHit(ev, pfTimeReference);
         if (hit) {
             console.log(JSON.stringify(hit));
             sendHit(hit);
         };
     });
```
<br>
----

# References
## [Google Analytics Reports](https://support.google.com/analytics/answer/1033861?hl=en)
User Timings hits have a [standard reporting section](https://support.google.com/analytics/answer/1205784#PageTimings) in the Google Analytics UI:
 - Behavior -> Site Speed -> User Timings
 - User timings latency hits can be drilled into following this structure:

The User Timings reports for this example gives access to the following general attribute structure.

**_Latency_** (Timing Value)<br>
 - **_Bidder_** (Category)<br>
   - **_AdUnit_** (Timing Variable)<br>
     - **_Bid_** (Timing Label)

At each level, a [Secondary Dimension](https://support.google.com/analytics/answer/6175970)
can be added to the table view. The screenshots below show the addition of a Secondary Dimension of "Ad Unit" and "Device Category" respectively.

Any Site Speed, User Timings report data can included into a Dashboard using the “Add to Dashboard” action at the top of the page. From the dashboard, thespecific presentation type, look and feel can be customized.
