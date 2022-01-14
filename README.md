# Webpage Discussions: Browser Extensions

This project explores how we can embed existing (and related?) discussions into the webpage that a user is viewing.

For instance, if a user browses abc.xyz/article-name, they might see related discussions from Hacker News, Reddit, Product Hunt, etc.

## Setup

### Running this project

- `npm install`
- `npm run build` to create the extension in the `build/` folder (final production output).
- For chrome: go to `chrome://extensions/` and `Load unpacked`, point it to the `build/` folder.
- For firefox: go to `about:debugging#/runtime/this-firefox` and `Load temporary extension`, point it to the `manifest.json`.

### Reloading extension after changes

- `npm run build`
- For chrome: Go to the extensions page and press the reload button
- Open a new tab and go to some webpage

### Structure

- `src/background/background.ts` is the entry point to the script that runs in the background.
- `src/content/content.tsx` is executed (with DOM access) in every matching URL (currently all URLs).
- `src/index.html` is the popup when the extension icon is clicked.

## Features

### Feature build order

1. Search hacker news and reddit every time we visit a new page (cache previously-visited pages for n hours or something)
2. Cache
3. Rate limit
4. Blacklist

### Possible features

- Search through all comments and show the user the most discussed / highly rated ones
- List all outbound links in HN/Reddit/etc comments (+ some context, the comment/thread?) so user can find relevant followup material
- Rank comments by relevancy (vs random off-topic comments)
- Show comments on top of the article in the right places (very difficult, need to know how to link text content in article to comments)

## Learning

### Resources used

- https://github.com/benwinding/newsit/
- https://thacoon.com/posts/create-react-app-browser-extension-with-tailwind/ -- to create the base repo, we followed all instructions including craco setup.
- Multiple outputs (very necessary) here: https://blog.logrocket.com/creating-chrome-extension-react-typescript/ -- still working this out
- We stopping following this: https://gist.github.com/mmazzarolo/0bec410e071a39d54d780abfcf3b72e7 -- for live reloading of extension

### Understanding extensions

- Sub-files in an extension, pointed to by `manifest.json`
  - `background`: launched when extension is launched, access to all APIs but no access to DOM
  - `popup`: launched when extension buttton is clicked (pretty much like options, but just a popup)
  - `options`: standalone options page for extension
  - `content`: launched in a tab which matches a particular set of URLs (can be all URLs, specified in manifest)
