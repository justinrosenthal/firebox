var path = require('path');

var APP_DIR = path.resolve(__dirname);

var config = {
  entry: APP_DIR + '/src/index.jsx',
  output: {
    path: APP_DIR + '/public/static/js',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR + '/src',
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  }
};

module.exports = config;
