const mix = require("laravel-mix");
// const glob = require("glob");
const ESLintPlugin = require("eslint-webpack-plugin");

const publicPath = "build";
const publicScriptPath = `${publicPath}/js`;
const srcPath = "src";
const srcScriptPath = `${srcPath}/js`;

mix.setPublicPath(publicPath);

mix
  .js(`${srcScriptPath}/index.js`, `${publicScriptPath}/index.js`)
  .sourceMaps(true, "inline-source-map");

mix.webpackConfig({
  plugins: [new ESLintPlugin()],
  experiments: {
    outputModule: true
  },
  output: {
    libraryTarget: "module"
  }
});
