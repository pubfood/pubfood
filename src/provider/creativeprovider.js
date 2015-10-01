'use strict';

var util = require('../util');
var BaseProvider = require('./baseprovider');

/**
 * CreativeProvider implements partner creative requests.
 *
 * @class
 * @memberOf pubfood/provider
 */
function CreativeProvider() {

}

util.inherits(CreativeProvider, BaseProvider);

module.exports = CreativeProvider;
