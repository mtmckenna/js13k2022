const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const TerserJSPlugin = require("terser-webpack-plugin");

module.exports = {
  // optimization: {
  //   minimizer: [
  //     new TerserJSPlugin({
  //       terserOptions: { compress: true, mangle: { properties: true } },
  //     }),
  //   ],
  //   minimize: true,
  // },
  plugins: [
    new HtmlWebpackPlugin({ template: "src/index.html", inject: "body" }),
    new CleanWebpackPlugin(),
  ],
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|wav)$/i,
        type: "asset/inline",
      },
      {
        test: /\.glsl$/i,
        use: "raw-loader",
      },
    ],
  },
};
