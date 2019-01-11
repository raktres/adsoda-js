
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'adsoda.js',
    library: 'adsoda'
    //libraryTarget: 'umd',
    //umdNamedDefine:true
  },//,
  optimization: {
    //splitChunks:{      chuncks: 'all'    }
    usedExports: true
  },
  module: {
    rules: [ 
        {
          loader: 'babel-loader',
          test: /\.js?/,
          //include: [path.resolve(__dirname,"src")],
          //use: 'babel-loader',
          exclude: /node_modules/,
          //query:{
          //  presets:['es2015'],
          //  plugins:['transform-runtime']
         // }

        },
    ] 
  }
 
  //rules: [
  //  { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
  //]

};
