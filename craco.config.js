// craco.config.js
const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        assert: require.resolve("assert/"),
        buffer: require.resolve("buffer/"),
        crypto: require.resolve("crypto-browserify"),
        os: require.resolve("os-browserify/browser"),
        process: require.resolve("process/browser.js"),
        stream: require.resolve("stream-browserify"),
        
  
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser.js",
        })
      );

      return webpackConfig;
    },
  },
};
