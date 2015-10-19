'use strict';

var path = require('path');
var hapi = require('hapi');
var boom = require('boom');
var fs = require('fs');

var DIST_DIR = path.join(__dirname, '..', 'dist');
var BID_PROVIDER_BASE_TAG_FILE = path.join(__dirname, 'bid-provider-base-tag.js');
var AUCTION_PROVIDER_BASE_TAG_FILE = path.join(__dirname, 'auction-provider-base-tag.js');

var server = new hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: path.join(__dirname, '..', 'public')
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
    if (request.params.ext === 'js') {
      reply.file(path.join(DIST_DIR, 'pubfood.js'));
      return;
    }
    if (request.params.ext === 'min.js') {
      reply.file(path.join(DIST_DIR, 'pubfood.min.js'));
      return;
    }
    reply(boom.notFound());
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
    var escapedAvailability = availability.replace('"', '\\x22');
    var globalProvider = request.params.provider;
    // poke in auctionInfo
    console.log([
      'Delaying simulated provider',
      globalProvider,
      'by:',
      actualDelay + 'ms'
    ].join(' '));
    setTimeout(function() {
      reply([
        globalProvider + '.setAvailable("' + escapedAvailability + '");',
        globalProvider + '.resume();'
      ].join('\n'));
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
