/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var jsdocPublish = require('jsdoc/templates/default/publish');
var path = require('path');
var fs = require('fs');

/**
 * @param {TAFFY} data See <http://taffydb.com/>.
 * @param {object} opts
 * @param {object} tutorials
 * @example {file} ./example.js
 */
exports.publish = function(data, opts, tutorials){
  //data({undocumented: true}).remove();

  //console.log(data({examples: false}));

  var docs = data().get(); // <-- an array of Doclet objects

  docs.forEach(function(doc){

    if(doc.examples && doc.examples.length){
      var code = doc.examples[0].match(/\{file\}(\s)*([^\s]+)/);
      if(code){
        var file = code[2];
        var p = path.join(doc.meta.path, file);
        //console.log('code', code);
        //console.log('file', file);
        //console.log('p', p);
        if (fs.existsSync(p)) {
          doc.examples[0] = fs.readFileSync(p, 'utf8');
        }
      }
      //console.log('>>>', doc);

    }

  });

  opts.template = path.resolve('./node_modules/jsdoc/templates/default');
  //console.log(jsdocPublish.publish.toString());
  jsdocPublish.publish(data, opts, tutorials);

  //console.log('opts', opts);
  //console.log('tutorials', tutorials);
  //console.log('data', data);

  //console.log('docs', docs);
};
