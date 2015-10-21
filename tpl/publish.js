/*global env: true */
'use strict';

var doop = require('jsdoc/util/doop');
var fs = require('jsdoc/fs');
var helper = require('jsdoc/util/templateHelper');
var path = require('jsdoc/path');
var taffy = require('taffydb').taffy;
var template = require('jsdoc/template');
var util = require('util');

var htmlsafe = helper.htmlsafe;
var linkto = helper.linkto;
var resolveAuthorLinks = helper.resolveAuthorLinks;
//var scopeToPunc = helper.scopeToPunc;
var hasOwnProp = Object.prototype.hasOwnProperty;

var data;
var view;

var allLinks = {
  'Global': 'Global'
};

var outdir = path.normalize(env.opts.destination);
var nav = '';
var homeHtmlData = [];
var classHtmlData = [];
var otherApiHtmlData = [];

function updateOutputFileContent(html, title, filename){
  var trimHtml = html.replace(/(\s|\t)+(\n)+(\s|\t)+/g, '\n').trim();

  if(title.match(/home/i)){
    homeHtmlData.push(trimHtml);
  } else if(title.match(/^class/i)){
    classHtmlData.push(trimHtml);
  } else {
    otherApiHtmlData.push(trimHtml);
  }
}

function saveOutputFileContent() {
  var header = fs.readFileSync(__dirname + '/tmpl/header.tmpl', 'utf-8');
  var footer = fs.readFileSync(__dirname + '/tmpl/footer.tmpl', 'utf-8');

  var apiContentOnlyHtml = homeHtmlData.concat(
    classHtmlData,
    otherApiHtmlData
  ).join('\n');

  var singlePageApiHtml = [header].concat(
    '<div id="main">' + apiContentOnlyHtml + '</div>',
    '<nav>' + nav + '</nav>',
    footer
  ).join('\n');

  fs.writeFileSync(path.join(outdir, 'index.html'), singlePageApiHtml, 'utf8');
  fs.writeFileSync(path.join(outdir, 'api_content_only.html'), apiContentOnlyHtml, 'utf8');
  fs.writeFileSync(path.join(outdir, 'api_nav_only.html'), nav, 'utf8');
}

function generateLink(config){
  var memberOf = (config.memberof || '').replace(/([^\a-z]+)/gi, '-');
  var link = (memberOf.length ? memberOf + '-' : '') + config.name;
  return link;
}

function linkTo(config){
  var name;
  var longname;

  if(typeof config === 'string'){
    name = config.replace(/([a-z]+)(\#|\~)([a-z]+)(\.)/, '');
    longname = config;
  } else {
    name = config.name;
    longname = config.longname;
  }

  if(!allLinks[longname]){
    return htmlsafe(longname);
  } else {
    var link = allLinks[longname];
    return '<a href="#' + link + '">' + htmlsafe(name) + '</a>';
  }
}

function greedyMatchLink(text) {
  var link = null;

  // test for Array.<type>
  if (text.match(/(.*)(\<)([^\>]+)(\>)/i)) {
    var links = [];
    var types = RegExp.$3.replace(/\s/g, '').split(',');
    types.forEach(function(type) {
      links.push( linkTo(type) );
    });

    link = RegExp.$1 + '&lt;' + links.join(', ') + '&gt;';
  }

  return link;
}

function linkToType(name){
  var link;
  var greedLinks = greedyMatchLink(name);

  if(greedLinks){
    link = greedLinks;
  } else if(allLinks[name]){
    link = linkTo(name);
  } else {
    var text = name.replace(/([a-z]+)(\#|\~)([a-z]+)(\.)/, '');
    link = htmlsafe(text);
  }

  return link;
}

function find(spec) {
  return helper.find(data, spec);
}

function hashToLink(doclet, hash) {
  if ( !/^(#.+)/.test(hash) ) { return hash; }

  var url = helper.createLink(doclet);

  url = url.replace(/(#.+|$)/, hash);
  return '<a href="' + url + '">' + hash + '</a>';
}

function needsSignature(doclet) {
  var needsSig = false;

  // function and class definitions always get a signature
  if (doclet.kind === 'function' || doclet.kind === 'class') {
    needsSig = true;
  }
  // typedefs that contain functions get a signature, too
  else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
    doclet.type.names.length) {
    for (var i = 0, l = doclet.type.names.length; i < l; i++) {
      if (doclet.type.names[i].toLowerCase() === 'function') {
        needsSig = true;
        break;
      }
    }
  }

  return needsSig;
}

function getSignatureAttributes(item) {
  var attributes = [];

  if (item.optional) {
    attributes.push('opt');
  }

  if (item.nullable === true) {
    attributes.push('nullable');
  }
  else if (item.nullable === false) {
    attributes.push('non-null');
  }

  return attributes;
}

function updateItemName(item) {
  var attributes = getSignatureAttributes(item);
  var itemName = item.name || '';

  if (item.variable) {
    itemName = '&hellip;' + itemName;
  }

  if (attributes && attributes.length) {
    itemName = util.format( '%s<span class="signature-attributes">%s</span>', itemName,
      attributes.join(', ') );
  }

  return itemName;
}

function addParamAttributes(params) {
  return params.filter(function(param) {
    return param.name && param.name.indexOf('.') === -1;
  }).map(updateItemName);
}

function buildItemTypeStrings(item) {
  var types = [];

  if (item && item.type && item.type.names) {
    item.type.names.forEach(function(name) {
      types.push( name );
    });
  }

  return types;
}

function buildAttribsString(attribs) {
  var attribsString = '';

  if (attribs && attribs.length) {
    attribsString = htmlsafe( util.format('(%s) ', attribs.join(', ')) );
  }

  return attribsString;
}

function addNonParamAttributes(items) {
  var types = [];

  items.forEach(function(item) {
    types = types.concat( buildItemTypeStrings(item) );
  });

  return types;
}

function addSignatureParams(f) {
  var params = f.params ? addParamAttributes(f.params) : [];

  f.signature = util.format( '%s(%s)', (f.signature || ''), params.join(', ') );
}

function addSignatureReturns(f) {
  var attribs = [];
  var attribsString = '';
  var returnTypes = [];
  var returnTypesString = '';

  // jam all the return-type attributes into an array. this could create odd results (for example,
  // if there are both nullable and non-nullable return types), but let's assume that most people
  // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
  if (f.returns) {
    f.returns.forEach(function(item) {
      helper.getAttribs(item).forEach(function(attrib) {
        if (attribs.indexOf(attrib) === -1) {
          attribs.push(attrib);
        }
      });
    });

    attribsString = buildAttribsString(attribs);
    returnTypes = addNonParamAttributes(f.returns);
  }

  var returnLinks = [];
  returnTypes.forEach(function(rType){
    returnLinks.push(linkToType(rType));
  });

  if (returnTypes.length) {
    returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnLinks.join('|') );
  }

  f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
    '<span class="type-signature">' + returnTypesString + '</span>';
}

function addSignatureTypes(f) {
  var types = f.type ? buildItemTypeStrings(f) : [];

  f.signature = (f.signature || '') + '<span class="type-signature">' +
    (types.length ? ' :' + types.join('|') : '') + '</span>';
}

function addAttribs(f) {
  var attribs = helper.getAttribs(f);
  var attribsString = buildAttribsString(attribs);

  // remove the parent path from class
  attribsString = attribsString.replace(/([a-z]+)(\#|\~)([a-z]+)(\.)/, '');

  f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}

function shortenPaths(files, commonPrefix) {
  Object.keys(files).forEach(function(file) {
    files[file].shortened = files[file].resolved.replace(commonPrefix, '')
      // always use forward slashes
      .replace(/\\/g, '/');
  });

  return files;
}

function getPathFromDoclet(doclet) {
  if (!doclet.meta) {
    return null;
  }

  return doclet.meta.path && doclet.meta.path !== 'null' ?
    path.join(doclet.meta.path, doclet.meta.filename) :
    doclet.meta.filename;
}

function generate(title, docs, filename, resolveLinks) {
  resolveLinks = resolveLinks === false ? false : true;

  var docData = {
    title: title,
    docs: docs
  };

  var html = view.render('container.tmpl', docData);

  if (resolveLinks) {
    // turn {@link foo} into <a href="foodoc.html">foo</a>
    html = helper.resolveLinks(html);

    // update links to use hash tag relative to the current page
    var links = html.match(/(")([^\s]+)?(\.html)(\#[^\"]+)?(")/ig);
    if(links){
      links.forEach(function(link){
        var hash = link
          .replace(/\.html/, '')
          .replace(/([^\a-z"]+)/gi, '-')
          .replace(/^"/, '"#');

        html = html.replace(link, hash).replace(/global-/, '');
      });
    }
  }

  updateOutputFileContent(html, title, filename);
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
  var symbols = {};

  // build a lookup table
  doclets.forEach(function(symbol) {
    symbols[symbol.longname] = symbols[symbol.longname] || [];
    symbols[symbol.longname].push(symbol);
  });

  return modules.map(function(module) {
    if (symbols[module.longname]) {
      module.modules = symbols[module.longname]
        // Only show symbols that have a description. Make an exception for classes, because
        // we want to show the constructor-signature heading no matter what.
        .filter(function(symbol) {
          return symbol.description || symbol.kind === 'class';
        })
        .map(function(symbol) {
          symbol = doop(symbol);

          if (symbol.kind === 'class' || symbol.kind === 'function') {
            symbol.name = symbol.name.replace('module:', '(require("') + '"))';
          }

          return symbol;
        });
    }
  });
}

function buildMemberNav(items, itemHeading, itemsSeen) {
  var nav = '';

  if (items.length) {
    var itemsNav = '';

    items.forEach(function(item) {
      if ( !hasOwnProp.call(item, 'longname') ) {
        itemsNav += '<li>' + item.name + '</li>';
      }
      else if ( !hasOwnProp.call(itemsSeen, item.longname) ) {
        itemsNav += '<li>' + linkTo(item) + '</li>';
        itemsSeen[item.longname] = true;
      }
    });

    if (itemsNav !== '') {
      nav += '<h3>' + itemHeading + '</h3><ul>' + itemsNav + '</ul>';
    }
  }

  return nav;
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
  var nav = '<h2><a href="index.html">Home</a></h2>';
  var seen = {};

  nav += buildMemberNav(members.modules, 'Modules', {});
  nav += buildMemberNav(members.externals, 'Externals', seen);
  nav += buildMemberNav(members.classes, 'Classes', seen);
  nav += buildMemberNav(members.events, 'Events', seen);
  nav += buildMemberNav(members.namespaces, 'Namespaces', seen);
  nav += buildMemberNav(members.mixins, 'Mixins', seen);
  nav += buildMemberNav(members.interfaces, 'Interfaces', seen);

  if (members.globals.length) {
    var globalNav = '';

    members.globals.forEach(function(g) {
      if ( g.kind !== 'typedef' && !hasOwnProp.call(seen, g.longname) ) {
        globalNav += '<li>' + linkTo(g) + '</li>';
      }
      seen[g.longname] = true;
    });

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += '<h3>' + linkTo('Global') + '</h3>';
    }
    else {
      nav += '<h3>Global</h3><ul>' + globalNav + '</ul>';
    }
  }

  return nav;
}

/**
 @param {TAFFY} taffyData See <http://taffydb.com/>.
 @param {object} opts
 @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
  data = taffyData;

  var conf = env.conf.templates || {};
  conf.default = conf.default || {};

  var templatePath = path.normalize(opts.template);
  view = new template.Template( path.join(templatePath, 'tmpl') );

  // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
  // doesn't try to hand them out later
  var indexUrl = helper.getUniqueFilename('index');
  // don't call registerLink() on this one! 'index' is also a valid longname

  var globalUrl = helper.getUniqueFilename('global');
  helper.registerLink('global', globalUrl);

  // set up templating
  //view.layout = conf.default.layoutFile ?
  //  path.getResourcePath(path.dirname(conf.default.layoutFile),
  //    path.basename(conf.default.layoutFile) ) :
  //  'layout.tmpl';

  // set up tutorials for helper
  helper.setTutorials(tutorials);

  data = helper.prune(data);
  data.sort('longname, version, since');
  helper.addEventListeners(data);

  // register all the links
  data().each(function(doclet) {
    var link = generateLink(doclet);
    if(!doclet.longname.match(/(string|null|object|undefined|boolean|number|function)/g)){
      // store long and short name
      allLinks[doclet.longname] = link;

      // @todo make sure that there aren't any collisions
      if(doclet.name){
        allLinks[doclet.name] = link;
      }
    }
  });

  var sourceFiles = {};
  var sourceFilePaths = [];
  data().each(function(doclet) {
    doclet.attribs = '';

    if (doclet.examples) {
      doclet.examples = doclet.examples.map(function(example) {
        var caption, code;

        if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
          caption = RegExp.$1;
          code = RegExp.$3;
        }

        if(example.match(/\{file\}(\s)*([^\s]+)/)){
          var file = RegExp.$2;
          var p = path.join(doclet.meta.path, file);
          if (fs.existsSync(p)) {
            code = fs.readFileSync(p, 'utf8');
          }
        }

        return {
          caption: caption || '',
          code: code || example
        };
      });
    }
    if (doclet.see) {
      doclet.see.forEach(function(seeItem, i) {
        doclet.see[i] = hashToLink(doclet, seeItem);
      });
    }

    // build a list of source files
    var sourcePath;
    if (doclet.meta) {
      sourcePath = getPathFromDoclet(doclet);
      sourceFiles[sourcePath] = {
        resolved: sourcePath,
        shortened: null
      };
      if (sourceFilePaths.indexOf(sourcePath) === -1) {
        sourceFilePaths.push(sourcePath);
      }
    }
  });

  // update outdir if necessary, then create outdir
  var packageInfo = ( find({kind: 'package'}) || [] ) [0];
  if (packageInfo && packageInfo.name) {
    outdir = path.join( outdir, packageInfo.name, (packageInfo.version || '') );
  }
  fs.mkPath(outdir);

  // copy the template's static files to outdir
  var fromDir = path.join(templatePath, 'static');
  var staticFiles = fs.ls(fromDir, 3);

  staticFiles.forEach(function(fileName) {
    var toDir = fs.toDir( fileName.replace(fromDir, outdir) );
    fs.mkPath(toDir);
    fs.copyFileSync(fileName, toDir);
  });

  // copy user-specified static files to outdir
  var staticFilePaths;
  var staticFileFilter;
  var staticFileScanner;
  if (conf.default.staticFiles) {
    // The canonical property name is `include`. We accept `paths` for backwards compatibility
    // with a bug in JSDoc 3.2.x.
    staticFilePaths = conf.default.staticFiles.include ||
      conf.default.staticFiles.paths ||
      [];
    staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
    staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

    staticFilePaths.forEach(function(filePath) {
      var extraStaticFiles;

      filePath = path.resolve(env.pwd, filePath);
      extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

      extraStaticFiles.forEach(function(fileName) {
        var sourcePath = fs.toDir(filePath);
        var toDir = fs.toDir( fileName.replace(sourcePath, outdir) );
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
      });
    });
  }

  if (sourceFilePaths.length) {
    sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
  }

  data().each(function(doclet) {
    var url = helper.createLink(doclet);
    helper.registerLink(doclet.longname, url);

    // add a shortened version of the full path
    var docletPath;
    if (doclet.meta) {
      docletPath = getPathFromDoclet(doclet);
      docletPath = sourceFiles[docletPath].shortened;
      if (docletPath) {
        doclet.meta.shortpath = docletPath;
      }
    }
  });

  data().each(function(doclet) {
    var url = helper.longnameToUrl[doclet.longname];

    if (url.indexOf('#') > -1) {
      doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
    }
    else {
      doclet.id = doclet.name;
    }

    if ( needsSignature(doclet) ) {
      addSignatureParams(doclet);
      addSignatureReturns(doclet);
      addAttribs(doclet);
    }
  });

  // do this after the urls have all been generated
  data().each(function(doclet) {
    //doclet.ancestors = getAncestorLinks(doclet);

    if (doclet.kind === 'member') {
      addSignatureTypes(doclet);
      addAttribs(doclet);
    }

    if (doclet.kind === 'constant') {
      addSignatureTypes(doclet);
      addAttribs(doclet);
      doclet.kind = 'member';
    }
  });

  var members = helper.getMembers(data);

  // add template helpers
  view.find = find;
  view.linkto = linkto;
  view.resolveAuthorLinks = resolveAuthorLinks;
  view.htmlsafe = htmlsafe;
  view.generateLink = generateLink;
  view.linkTo = linkTo;
  view.linkToType = linkToType;

  // once for all
  nav = buildNav(members);
  attachModuleSymbols( find({ longname: {left: 'module:'} }), members.modules );

  if (members.globals.length) {
    generate('Global', [{kind: 'globalobj'}], globalUrl);
  }

  // index page displays information from package.json and lists files
  var files = find({kind: 'file'});
  var packages = find({kind: 'package'});

  generate('Home',
    packages.concat(
      [{kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'}]
    ).concat(files),
    indexUrl);

  // set up the lists that we'll use to generate pages
  var classes = taffy(members.classes);
  var modules = taffy(members.modules);
  var namespaces = taffy(members.namespaces);
  var mixins = taffy(members.mixins);
  var externals = taffy(members.externals);
  var interfaces = taffy(members.interfaces);

  Object.keys(helper.longnameToUrl).forEach(function(longname) {
    var myModules = helper.find(modules, {longname: longname});
    if (myModules.length) {
      generate('Module: ' + myModules[0].name, myModules, helper.longnameToUrl[longname]);
    }

    var myClasses = helper.find(classes, {longname: longname});
    if (myClasses.length) {
      generate('Class: ' + myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
    }

    var myNamespaces = helper.find(namespaces, {longname: longname});
    if (myNamespaces.length) {
      generate('Namespace: ' + myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
    }

    var myMixins = helper.find(mixins, {longname: longname});
    if (myMixins.length) {
      generate('Mixin: ' + myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
    }

    var myExternals = helper.find(externals, {longname: longname});
    if (myExternals.length) {
      generate('External: ' + myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
    }

    var myInterfaces = helper.find(interfaces, {longname: longname});
    if (myInterfaces.length) {
      generate('Interface: ' + myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
    }
  });

  saveOutputFileContent();
};
