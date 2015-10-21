'use strict';

var path = require('path');
var hapi = require('hapi');
var boom = require('boom');
var querystring = require('querystring');
var fs = require('fs');

var WEB_DIR = path.join(__dirname, '..', 'public');
var BID_PROVIDER_BASE_TAG_FILE = path.join(__dirname, 'bid-provider-base-tag.js');
var AUCTION_PROVIDER_BASE_TAG_FILE = path.join(__dirname, 'auction-provider-base-tag.js');

var server = new hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: WEB_DIR
      }
    }
  }
});

server.connection({
  port: 3002,
  host: 'localhost'
});

server.route({
  method: 'GET',
  path: '/pubfood.{ext}',
  handler: function routeHandler(request, reply) {
    return reply.file(path.join(WEB_DIR, request.url.path));
  }
});

server.route({
  method: 'GET',
  path: '/simulated-bid-provider/{provider}.js',
  handler: function routeHandler(request, reply) {
    fs.readFile(BID_PROVIDER_BASE_TAG_FILE, function(err, file) {
      if (err) {
        console.log(err);
        return reply(boom.badImplementation());
      }
      var providerTag = file.toString()
        .replace(/PROVIDER_GLOBAL/g, request.params.provider)
        // this assumes all ending script tags are literally `</script>`
        // in the source and nothing fancy that would trick us here
        .replace(/<\/script>/g, '\\x3c/script>');
      reply(providerTag).type('text/javascript');
    });
  }
});

server.route({
  method: 'GET',
  path: '/simulated-auction-provider/{provider}.js',
  handler: function routeHandler(request, reply) {
    fs.readFile(AUCTION_PROVIDER_BASE_TAG_FILE, function(err, file) {
      if (err) {
        console.log(err);
        return reply(boom.badImplementation());
      }
      var providerTag = file.toString()
        .replace(/PROVIDER_GLOBAL/g, request.params.provider)
        // this assumes all ending script tags are literally `</script>`
        // in the source and nothing fancy that would trick us here
        .replace(/<\/script>/g, '\\x3c/script>');
      reply(providerTag).type('text/javascript');
    });
  }
});

server.route({
  method: 'GET',
  path: '/simulated-auction-provider/{provider}/enable',
  handler: function routeHandler(request, reply) {
    var DEFAULT_DELAY = 20;
    var DEFAULT_FUZZ = 10;
    var parsedDelay = parseInt(request.query.delay, 0);
    var delay = isFinite(parsedDelay) ? parsedDelay : DEFAULT_DELAY;
    var parsedFuzz = parseInt(request.query.fuzz, 0);
    var fuzz = isFinite(parsedFuzz) ? parsedFuzz : DEFAULT_FUZZ;
    var actualDelay = Math.round(delay + ((2 * Math.random() - 1) * fuzz), 3);
    var names = (request.query.name || '').split('|').map(function (d) {
      return querystring.unescape(d);
    });
    var elIds = (request.query.elid || '').split('|').map(function (d) {
      return querystring.unescape(d);
    });
    var sizes = (request.query.size || '').split('|').map(function (d) {
      return querystring.unescape(d).split(',').map(function (e) {
        var parts = e.split('x');
        return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
      });
    });
    var target = (request.query.target || '').split('|').map(function (d) {
      return querystring.unescape(d);
    });
    console.log('names', names);
    console.log('elIds', elIds);
    console.log('sizes', sizes);
    console.log('target', target);
    var globalProvider = request.params.provider;
    var htmlSafe = function (str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    var encodedCalls = names.map(function (name, i) {
      var selectedSize = sizes[i][0];
      var encodedContents = [
        '<div style="width: ' + (selectedSize[0] - 12) + 'px; height: ' + (selectedSize[1] - 12) + 'px;border:solid 1px #aaa;padding:5px">',
        '<h3>name: ' + htmlSafe(name) + '</h3>',
        '<h4>id: <code>' + htmlSafe(elIds[i]) + '</code></h4>',
        '<p>sizes: <code>' + JSON.stringify(sizes[i]) + '</code></p>',
        '<p>target: <code>' + htmlSafe(target[i]) + '</code></p>',
        '</div>'
      ]
      .join('')
      // do simple escaping of double quotes but nothing fancy since we trust
      .replace(/"/g, '\\x22');
      return globalProvider + '.fillSlot("' + elIds[i] + '",[' + selectedSize + '],"' + encodedContents + '");';
    });
    console.log([
      'Delaying simulated auction provider',
      globalProvider,
      'by:',
      actualDelay + 'ms'
    ].join(' '));
    setTimeout(function() {
      reply([
        encodedCalls.join('\n'),
        // TODO see if this fillSlot on an assumed defined slot is a good idea
        // globalProvider + '.fillSlot("div-rail",[300,250],"' + 'allo allo' + '");',
        globalProvider + '.resume();'
      ].join('\n')).type('text/javascript');
    }, actualDelay);
  }
});

server.route({
  method: 'GET',
  path: '/simulated-bid-provider/{provider}/refresh',
  handler: function routeHandler(request, reply) {
    var DEFAULT_DELAY = 20;
    var DEFAULT_FUZZ = 10;
    var parsedDelay = parseInt(request.query.delay, 0);
    var delay = isFinite(parsedDelay) ? parsedDelay : DEFAULT_DELAY;
    var parsedFuzz = parseInt(request.query.fuzz, 0);
    var fuzz = isFinite(parsedFuzz) ? parsedFuzz : DEFAULT_FUZZ;
    var actualDelay = Math.round(delay + ((2 * Math.random() - 1) * fuzz), 3);
    var availability = request.query.availability || '';
    // do simple escaping of double quotes but nothing fancy since we trust
    var escapedAvailability = availability.replace(/"/g, '\\x22');
    var globalProvider = request.params.provider;
    console.log([
      'Delaying simulated bid provider',
      globalProvider,
      'by:',
      actualDelay + 'ms'
    ].join(' '));
    setTimeout(function() {
      reply([
        globalProvider + '.setAvailable("' + escapedAvailability + '");',
        globalProvider + '.resume();'
      ].join('\n')).type('text/javascript');
    }, actualDelay);
  }
});

server.register([{
  register: require('inert')
}], function(err) {
  if (err) {
    console.log('Failed to load inert');
  }
  // do static serving out of the public directory
  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true
      }
    }
  });
  server.start(function() {
    console.log('Server started at:');
    console.log(server.info.uri);
  });
});
