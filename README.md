# Webpage Discussions: Browser Extension

This project explores how we can embed existing (and related?) discussions into the webpage that a user is viewing.

For instance, if a user browses abc.xyz/article-name, they might see related discussions from Hacker News, Reddit, Product Hunt, etc.

## Setup

### Running this project

- `npm install`
- `npm start`
- For chrome: go to `chrome://extensions/` and `Load unpacked`, point it to the `build/` folder.
- (Outdated: need to re-confirm, probably doesn't work) For firefox: go to `about:debugging#/runtime/this-firefox` and `Load temporary extension`, point it to the `manifest.json`.

### Design choices

- **Why does the background script do the work instead of parallelizing across content scripts?**: Because of CORS issues, only background scripts can successfully make the API calls (specifically to old.reddit.com).

### Possible features

**Simple**

- [ ] iFrame to display on page on click
- [ ] Tooltips for keyboard shortcuts
- [ ] Sort by Newest / Oldest, Highest points / Lowest points, Highest points by Newest year, Highest points by Oldest year

**Advanced**

- Search through all comments and show the user the most discussed / highly rated ones
- List all outbound links in HN/Reddit/etc comments (+ some context, the comment/thread?) so user can find relevant followup material
- Rank comments by relevancy (vs random off-topic comments)
- Show comments on top of the article in the right places (very difficult, need to know how to link text content in article to comments)

## Learning

### Resources used

- https://github.com/benwinding/newsit/
- https://thacoon.com/posts/create-react-app-browser-extension-with-tailwind/ -- to create the base repo, we followed all instructions including craco setup.
- Multiple outputs (very necessary) here: https://blog.logrocket.com/creating-chrome-extension-react-typescript/ -- still working this out
- We stopped following this: https://gist.github.com/mmazzarolo/0bec410e071a39d54d780abfcf3b72e7 -- for live reloading of extension -- this doesn't work with out current setup.

### Understanding extensions

- Sub-files in an extension, pointed to by `manifest.json`
  - `background`: launched when extension is launched, access to all APIs but no access to DOM
  - `popup`: launched when extension buttton is clicked (pretty much like options, but just a popup)
  - `options`: standalone options page for extension
  - `content`: launched in a tab which matches a particular set of URLs (can be all URLs, specified in manifest)

<img src="src/assets/img/icon-128.png" width="64"/>

# Instructions specific to boilerplate used for this project

## Features

This is a basic Chrome Extensions boilerplate to help you write modular and modern Javascript code, load CSS easily and [automatic reload the browser on code changes](https://webpack.github.io/docs/webpack-dev-server.html#automatic-refresh).

This boilerplate has the following features:

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/)
- [Tailwind 3](https://tailwindcss.com/)
- [React 17](https://reactjs.org)
- [Webpack 5](https://webpack.js.org/)
- [Webpack Dev Server 4](https://webpack.js.org/configuration/dev-server/)
- [React Hot Loader](https://github.com/gaearon/react-hot-loader)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
3. Change the package's `name`, `description`, and `repository` fields in `package.json`.
4. Change the name of your extension on `src/manifest.json`.
5. Run `npm install` to install the dependencies.
6. Run `npm start`
7. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.

## Structure

All your extension's code must be placed in the `src` folder.

The boilerplate is already prepared to have a popup, an options page, a background page, and a new tab page (which replaces the new tab page of your browser). But feel free to customize these.

## TypeScript

This boilerplate now supports TypeScript! The `Options` Page is implemented using TypeScript. Please refer to `src/pages/Options/` for example usages.

## Webpack auto-reload and HRM

To make your workflow much more efficient this boilerplate uses the [webpack server](https://webpack.github.io/docs/webpack-dev-server.html) to development (started with `npm start`) with auto reload feature that reloads the browser automatically every time that you save some file in your editor.

You can run the dev mode on other port if you want. Just specify the env var `port` like this:

```
$ PORT=6002 npm run start
```

## Content Scripts

Although this boilerplate uses the webpack dev server, it's also prepared to write all your bundles files on the disk at every code change, so you can point, on your extension manifest, to your bundles that you want to use as [content scripts](https://developer.chrome.com/extensions/content_scripts), but you need to exclude these entry points from hot reloading [(why?)](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate/issues/4#issuecomment-261788690). To do so you need to expose which entry points are content scripts on the `webpack.config.js` using the `chromeExtensionBoilerplate -> notHotReload` config. Look the example below.

Let's say that you want use the `myContentScript` entry point as content script, so on your `webpack.config.js` you will configure the entry point and exclude it from hot reloading, like this:

```js
{
  …
  entry: {
    myContentScript: "./src/js/myContentScript.js"
  },
  chromeExtensionBoilerplate: {
    notHotReload: ["myContentScript"]
  }
  …
}
```

and on your `src/manifest.json`:

```json
{
  "content_scripts": [
    {
      "matches": ["https://www.google.com/*"],
      "js": ["myContentScript.bundle.js"]
    }
  ]
}
```

## Packing

After the development of your extension run the command

```
$ NODE_ENV=production npm run build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.

## Secrets

If you are developing an extension that talks with some API you probably are using different keys for testing and production. Is a good practice you not commit your secret keys and expose to anyone that have access to the repository.

To this task this boilerplate import the file `./secrets.<THE-NODE_ENV>.js` on your modules through the module named as `secrets`, so you can do things like this:

_./secrets.development.js_

```js
export default { key: "123" };
```

_./src/popup.js_

```js
import secrets from "secrets";
ApiCall({ key: secrets.key });
```

:point_right: The files with name `secrets.*.js` already are ignored on the repository.

## Resources:

- [Webpack documentation](https://webpack.js.org/concepts/)
- [Chrome Extension documentation](https://developer.chrome.com/extensions/getstarted)

## Credits

- Michael Xieyang Liu | [Website](https://lxieyang.github.io)
- This boilerplate is largely derived from [lxieyang/vertical-tabs-chrome-extension](https://github.com/lxieyang/vertical-tabs-chrome-extension) and [lxieyang/chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react) (which in turn is adapted from [samuelsimoes/chrome-extension-webpack-boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)).
