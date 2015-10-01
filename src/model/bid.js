'use strict';

var util = require('../util');
var BaseModelObject = require('./basemodelobject');

/**
 * Bid is the result of a partner [BidProvider]{@link pubfood/provider.BidProvider} request.
 *
 * @class
 * @memberOf pubfood/model
 */
function Bid() {
    if (this.init) {
        this.init();
    }
}

Bid.prototype.value = function (v) {
    this.value = v;
    return this;
};

Bid.prototype.slot = function(s) {
    this.slot = s;
    return this;
};

Bid.prototype.provider = function(p) {
    this.provider = p;
    return this;
};

util.inherits(Bid, BaseModelObject);

module.exports = Bid;
