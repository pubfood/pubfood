/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var fs = require('fs');

var cleanName = function(text, x) {
  return (text || '').trim().replace(/(\#|\/|\~|\-|\:)/g, (x || '.'));
};

//http://bl.ocks.org/d3noob/8329404
var createCollapsibleTreeDataStructure = function(docs) {
  var data = [];

  docs.forEach(function(doc) {
    var path = cleanName(doc.longname);
    var memberOf = cleanName(doc.memberof);
    var name = path.split('.').pop();

    data.push({
      name: path,
      shortName: name,
      parent: memberOf,
      type: doc.kind
    });
  });

  //console.log(data);

  var dataMap = data.reduce(function(map, node) {
    map[node.name] = node;
    return map;
  }, {});

// create the tree array
  var treeData = [];
  data.forEach(function(node) {
    // add to parent
    var parent = dataMap[node.parent];
    if (parent) {
      // create child array if it doesn't exist
      (parent.children || (parent.children = []))
        // add node to child array
        .push(node);
    } else {
      // parent is null or missing
      treeData.push(node);
    }
  });

  var obj = {
    name: 'root',
    children: treeData
  };
  return obj;
};

/**
 @param {TAFFY} data
 @param {object} opts
 */
exports.publish = function(data, opt) {
  data({undocumented: true}).remove();
  data({kind: 'package'}).remove();

  //an array of Doclet objects
  var docs = data().get();

  //console.log(opt);
  var mainObj = createCollapsibleTreeDataStructure(docs);

  var content = fs.readFileSync(__dirname + '/diagram.html', 'utf-8');
  var dataJsFile = opt.destination + '/diagram.data.js';
  var dataHtmlFile = opt.destination + '/diagram.html';

  var data = [
    'var mainObj = ' + JSON.stringify(mainObj, null, 2) + ';'
  ].join('\n');

  fs.writeFileSync(dataHtmlFile, content, 'utf-8');
  fs.writeFileSync(dataJsFile, data, 'utf-8');
};
