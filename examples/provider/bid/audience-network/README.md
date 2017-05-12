# audience-network-bid-delegate

BidProvider for Audience Network

## Usage

1. Create a new App at https://developers.facebook.com/apps
2. Add the Audience Network product to it
3. Create a new Placement to generate your `placementId`
4. To test, ensure the `User-Agent` request header represents a mobile device

```html
<script src="pubfood.min.js"></script>
<script src="audience-network-bid-delegate.min.js"></script>
<script>

var pf = new pubfood();
pf.addBidProvider(audienceNetworkBidDelegate());
pf.addSlot({
  name: '/5555555/hb_300x250',
  sizes: [[300, 250]],
  elementId: 'div-gpt-ad-555555555555555-0',
  bidProviders: ['audience-network']
}).setParam('audience-network': {
  placementId: '555555555555555_555555555555555'
});

pf.setAuctionProvider( ... );
pf.start( ... );

</script>
```

## Adserver targeting

The following key/value pairs are set on each bid for additional adserver targeting:

* `hb_bidder`: The String 'fan'.
* `hb_pb`: Bid value in CPM.
* `fb_placementid`: Audience Network placementId for the slot.
* `fb_bidid`: Bid ID returned by the Audience Network API call.
* `fb_format`: One of '300x250', '320x50', 'fullwidth' or 'native'.

## Development

The minified `audience-network-bid-delegate.min.js`
can be rebuilt and tested from the ES2015 source:

```sh
npm install && npm test && npm run build
```
