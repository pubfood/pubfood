/**
 * @file Audience Network BidDelegate.
 */
import 'whatwg-fetch';

const name = 'audience-network';

/**
 * Does this slot contain valid parameters?
 * @param {Object} slot
 * @returns {Boolean}
 */
const validateSlot = slot =>
  typeof slot === 'object' &&
  typeof slot.name === 'string' &&
  typeof slot.elementId === 'string' &&
  Array.isArray(slot.sizes) &&
  slot.sizes.length > 0;

/**
 * Flattens a 2-element [W, H] array as a 'WxH' string,
 * otherwise passes value through.
 * @param {Array<Number>|String} size
 * @returns {String}
 */
const flattenSize = size =>
  (Array.isArray(size) && size.length === 2) ? `${size[0]}x${size[1]}` : size;

/**
 * Is this a valid slot size?
 * @param {String} size
 * @returns  {Boolean}
 */
const isValidSize = size => ['native', 'fullwidth', '300x250', '320x50'].includes(size);

/**
 * URL builder for Audience Network API call.
 * @param {Array<String>} placementids - list of placement ids
 * @param {Array<String>} adformats - list of ad formats
 * @returns {String} URL
 */
const url = (placementids, adformats) =>
  ['https://an.facebook.com/v2/placementbid.json?sdk=5.5.web']
    .concat(placementids.map( placementid => `placementids[]=${placementid}` ))
    .concat(adformats.map( adformat => `adformats[]=${adformat}` ))
    .join('&');

/**
 * Is this a native advert size?
 * @param {String} size
 * @returns {Boolean}
 */
const isNative = (size) => ['native', 'fullwidth'].includes(size);

/**
 * Initial bid request
 * @param {Array} slots - Slots to bid on
 * @param {Function} pushBid - Callback to execute on next bid available
 * @param {Function} done - Callback to execute on done
 */
const init = (slots, pushBid, done) => {
  // Build placementids and adformats lists
  const placementids = [];
  const adformats = [];
  const slotNames = [];
  slots
    .filter(validateSlot)
    .forEach(slot => slot.sizes
      .map(flattenSize)
      .filter(isValidSize)
      .forEach(size => {
        placementids.push(slot.getParam(name).placementId);
        adformats.push(size);
        slotNames.push(slot.name);
      })
    );

  if (placementids.length) {
    fetch(url(placementids, adformats), { credentials: 'include' })
      .then( res => res.json() )
      .then( data => {
        if (Array.isArray(data.errors) && data.errors.length) {
          done(new Error(data.errors.join()));
        } else {
          // For each placementId in bids Object
          Object.keys(data.bids)
            // extract Array of bid responses
            .map( placementId => data.bids[placementId] )
            // flatten
            .reduce( (a, b) => a.concat(b), [] )
            // call pushBid
            .forEach( (bid, i) => {
              const value = String((Math.floor(bid.bid_price_cents / 10) / 10).toFixed(2));
              pushBid({
                id: bid.bid_id,
                slot: slotNames[i],
                value,
                sizes: isNative(adformats[i]) ? [300, 250] : adformats[i].split('x').map(Number),
                targeting: {
                  hb_bidder: 'fan',
                  hb_pb: value,
                  fb_placementid: bid.placement_id,
                  fb_bidid: bid.bid_id,
                  fb_format: adformats[i]
                }
              });
            });
          done();
        }
      })
      .catch(done);
  } else {
    done(new Error('No valid slots requested'));
  }
};

/**
 * @class AudienceNetworkBidDelegate
 * @type {Object}
 * @property {String} name - Bid provider delegate name
 * @property {Function} init - Initial bid request
 */
const AudienceNetworkBidDelegate = () => {
  return { name, init, refresh: init };
};
module.exports = AudienceNetworkBidDelegate;
