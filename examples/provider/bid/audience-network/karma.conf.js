module.exports = function(config) {
  config.set({
    frameworks: ['browserify', 'mocha', 'sinon'],
    files: [
      'test/**/*.spec.js',
      'node_modules/whatwg-fetch/fetch.js'
    ],
    preprocessors: {
      'test/**/*.spec.js': 'browserify'
    },
    browserify: {
      transform: [
        ['babelify', {
          presets: ['es2015'],
          plugins: ['istanbul']
        }]
      ],
      debug: true
    },
    reporters: ['progress', 'coverage'],
    browsers: ['Chrome'],
    singleRun: true
  });
};
