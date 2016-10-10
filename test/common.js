/**
 * pubfood
 */
'use strict';

/*eslint no-unused-vars: 0*/
/*eslint no-undef: 0*/

// set up some dom stuff
// @todo consider using `node-jsdom` if DOM manipulation required
var fakeDom = {
  appendChild: function() {
    return {};
  },
  createElement: function() {
    return {};
  },
};

if (!global.window) {
  global.window = {};
}
if (!global.document) {
  global.document = fakeDom;
  global.document.head = fakeDom;
  global.document.body = fakeDom;
  global.document.documentElement = fakeDom;
}

