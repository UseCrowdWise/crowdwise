// Idea from https://blog.logrocket.com/creating-chrome-extension-react-typescript/
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" &&
              require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          content: "./src/content/content.tsx",
          background: "./src/background/background.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js",
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
          // Crucial so that we can refer to the CSS files by a deterministic name in the manifest
          chunkIds: "deterministic",
        },
      };
    },
  },
};
