const mix = require("laravel-mix");
const StyleLintPlugin = require("stylelint-webpack-plugin");

const publicPath = "build";
const publicStylePath = `${publicPath}/css`;
const srcPath = "src";
const srcStylePath = `${srcPath}/scss`;

mix.setPublicPath(publicPath);

mix
  .sass(`${srcStylePath}/styles.scss`, `${publicStylePath}/styles.css`)
  .sourceMaps(true, "inline-source-map");

mix.webpackConfig({
  plugins: [new StyleLintPlugin()]
});
