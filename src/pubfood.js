'use strict';

/**
 * Pubfood.
 *
 * A browser client header bidding JavaScript library.
 *
 * @module pubfood
 */
(function(global, undefined, ctor) {

  if (global) {
    module.exports = ctor(global, global.pfConfig || {});
  }

}(window || {}, undefined, function(global, config) {
  /**
   * @memberOf module:pubfood
   * @private
   */
  var pubfood = function(config) {
    return new pubfood.library.init(config);
  };
  var model = require('./model');

  pubfood.library = pubfood.prototype = {
    version: '0.0.1',
    whoAmI: function() {
      console.log('instanceOf \'pubfood\' v' + this.version);
    },
    model: require('./model'),
    ybprovider: require('./provider/vendor/yieldbotbidprovider'),
    _pubfoodRx: require('rx/dist/rx.all')
  };

  pubfood.log = function(msg) {
    console.log(msg);
  };

  var api = pubfood.library.init = function(config) {
    this.config = config;

    return this;
  };

  api.prototype = {
    pubfood: pubfood.library,
    mediator: require('./mediator'),
    provider: require('./provider'),
    assembler: require('./assembler')

  };

  global.pubfood = pubfood;
  return pubfood;
}));
