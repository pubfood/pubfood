/**
 * @file Tests for Audience Network BidDelegate.
 */
import fetchMock from 'fetch-mock';
import chai, { expect } from 'chai';
import checkChai from 'check-chai';
chai.use(checkChai);

import AudienceNetworkBidDelegate from '../src/audience-network-bid-delegate';

const placementId = 'test-placement-id';

describe('Audience Network BidDelegate', () => {

  describe('Public API', () => {
    const adapter = AudienceNetworkBidDelegate();
    it('name', () => {
      expect(adapter.name).to.be.a('string');
      expect(adapter.name).to.equal('audience-network');
    });
    it('init', () => {
      expect(adapter.init).to.be.a('function');
    });
    it('refresh', () => {
      expect(adapter.refresh).to.be.a('function');
    });
  });

  describe('init parameter parsing', () => {
    let adapter;
    let pushBid;

    beforeEach( () => {
      adapter = AudienceNetworkBidDelegate();
      pushBid = sinon.spy();
    });

    describe('invalid slots', () => {
      [
        [],
        [{
          name: 'slot-only-sizes',
          sizes: []
        }],
        [{
          name: 'slot-only-element-id',
          elementId: 'test-element-id'
        }],
        [{
          name: 'slot-getParam-empty-object',
          elementId: 'test-element-id',
          sizes: ['native'],
          getParam: () => ({})
        }]
      ].forEach( slot => it(`${slot.name}`, done => {
        adapter.init(slot, pushBid, err => {
          expect(err).to.be.an.instanceof(Error);
          expect(pushBid.called).to.equal(false);
          done();
        });
      }));
    });

    describe('invalid sizes', () => {
      let adapter;
      let slot;
      let pushBid;

      beforeEach( () => {
        adapter = AudienceNetworkBidDelegate();
        pushBid = sinon.spy();
        slot = {
          name: 'test-slot-name',
          elementId: 'test-element-id',
          sizes: [],
          getParam: () => ({ placementId })
        };
      });

      [
        '', undefined, null, '300x100', [300, 100], [300], {}
      ].forEach( size => it(`invalid size ${size}`, done => {
        slot.sizes = [size];
        adapter.init([slot], pushBid, err => {
          expect(err).to.be.an.instanceof(Error);
          expect(pushBid.called).to.equal(false);
          done();
        });
      }));
    });
  });

  describe('pushBid', () => {
    const slot = {
      name: 'test-slot-name',
      elementId: 'test-element-id',
      sizes: [[320, 50], [300, 250], '300x250', '320x50', 'fullwidth', 'native'],
      getParam: () => ({ placementId })
    };
    let adapter;
    let pushBid;

    beforeEach( () => {
      adapter = AudienceNetworkBidDelegate();
      pushBid = sinon.spy();
    });
    afterEach( () => fetchMock.restore() );

    it('handles error response', done => {
      fetchMock.getOnce('^https://an.facebook.com/v2/placementbid.json?sdk=5.5.web', {
        errors: [ 'test-error-1', 'test-error-2' ]
      });
      // Make bid request
      adapter.init([slot], pushBid, err => {
        chai.check(done, () => {
          // Verify
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal('test-error-1,test-error-2');
          expect(fetchMock.done()).to.equal(true);
          expect(pushBid.called).to.equal(false);
        });
      });
    });

    it('single slot, multiple sizes', done => {
      // Mock bid response
      fetchMock.getOnce('^https://an.facebook.com/v2/placementbid.json?sdk=5.5.web', {
        errors: [],
        bids: {
          [placementId]: [
            { placement_id: placementId, bid_id: 'id1', bid_price_cents: 123, bid_price_currency: 'usd', bid_price_model: 'cpm' },
            { placement_id: placementId, bid_id: 'id2', bid_price_cents: 234, bid_price_currency: 'usd', bid_price_model: 'cpm' },
            { placement_id: placementId, bid_id: 'id3', bid_price_cents: 345, bid_price_currency: 'usd', bid_price_model: 'cpm' },
            { placement_id: placementId, bid_id: 'id4', bid_price_cents: 456, bid_price_currency: 'usd', bid_price_model: 'cpm' },
            { placement_id: placementId, bid_id: 'id5', bid_price_cents: 567, bid_price_currency: 'usd', bid_price_model: 'cpm' },
            { placement_id: placementId, bid_id: 'id6', bid_price_cents: 678, bid_price_currency: 'usd', bid_price_model: 'cpm' }
          ]
        }
      });
      // Make bid request
      adapter.init([slot], pushBid, err => {
        chai.check(done, () => {
          expect(err).to.not.be.an.instanceof(Error);
          // Verify fetch occurred with expected URL and options
          expect(fetchMock.done()).to.equal(true);
          expect(fetchMock.lastUrl()).to.contain('&placementids[]=test-placement-id'.repeat(6));
          expect(fetchMock.lastUrl()).to.contain('adformats[]=320x50&adformats[]=300x250&adformats[]=300x250&adformats[]=320x50&adformats[]=fullwidth&adformats[]=native');
          expect(fetchMock.lastOptions()).to.deep.equal({ credentials: 'include' });
          // Verify pushBid was called per size
          expect(pushBid.callCount).to.equal(6);
          expect(pushBid.args[0][0]).to.deep.equal({
            id: 'id1',
            slot: 'test-slot-name',
            value: '1.20',
            sizes: [320, 50],
            targeting: {
              hb_bidder: 'fan',
              hb_pb: '1.20',
              fb_placementid: placementId,
              fb_bidid: 'id1',
              fb_format: '320x50'
            }
          });
          expect(pushBid.args[1][0]).to.deep.equal({
            id: 'id2',
            slot: 'test-slot-name',
            value: '2.30',
            sizes: [300, 250],
            targeting: {
              hb_bidder: 'fan',
              hb_pb: '2.30',
              fb_placementid: placementId,
              fb_bidid: 'id2',
              fb_format: '300x250'
            }
          });
          expect(pushBid.args[2][0]).to.deep.equal({
            id: 'id3',
            slot: 'test-slot-name',
            value: '3.40',
            sizes: [300, 250],
            targeting: {
              hb_bidder: 'fan',
              hb_pb: '3.40',
              fb_placementid: placementId,
              fb_bidid: 'id3',
              fb_format: '300x250'
            }
          });
          expect(pushBid.args[3][0]).to.deep.equal({
            id: 'id4',
            slot: 'test-slot-name',
            value: '4.50',
            sizes: [320, 50],
            targeting: {
              hb_bidder: 'fan',
              hb_pb: '4.50',
              fb_placementid: placementId,
              fb_bidid: 'id4',
              fb_format: '320x50'
            }
          });
          expect(pushBid.args[4][0]).to.deep.equal({
            id: 'id5',
            slot: 'test-slot-name',
            value: '5.60',
            sizes: [300, 250],
            targeting: {
              hb_bidder: 'fan',
              hb_pb: '5.60',
              fb_placementid: placementId,
              fb_bidid: 'id5',
              fb_format: 'fullwidth'
            }
          });
          expect(pushBid.args[5][0]).to.deep.equal({
            id: 'id6',
            slot: 'test-slot-name',
            value: '6.70',
            sizes: [300, 250],
            targeting: {
              hb_bidder: 'fan',
              hb_pb: '6.70',
              fb_placementid: placementId,
              fb_bidid: 'id6',
              fb_format: 'native'
            }
          });
        });
      });
    });
  });

});
