const path = require('path');
const slsw = require('serverless-webpack');
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ],
  },
  plugins: [new CopyPlugin([
    {
      from: './node_modules/argon2/prebuilds/**',
      to: './',
      transformPath: (targetPath, _absPath) => {
        const pathFragment = path.parse(targetPath);
        // drop the node_modules folder
        const pathDirs = pathFragment.dir.split(path.sep);
        pathDirs.splice(0, 1);
        return path.join(...pathDirs, pathFragment.base);
        // return targetPath;
      }
    }
  ])],
  externals: {
    argon2: 'argon2'
  }
};

