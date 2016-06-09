var path = require('path');

var APP_DIR = path.resolve(__dirname);

var config = {
  entry: APP_DIR + '/src/index.jsx',
  output: {
    path: APP_DIR + '/public/js',
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
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
  },
  externals: {
    'firebase': 'firebase',
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};

module.exports = config;
