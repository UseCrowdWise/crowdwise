# Webpage Discussions: Browser Extensions

This project explores how we can embed existing (and related?) discussions into the webpage that a user is viewing.

For instance, if a user browses abc.xyz/article-name, they might see related discussions from Hacker News, Reddit, Product Hunt, etc.

## Running this project

- `npm build` to create the extension in the `build/` folder (final production output).
- `npm run watch` does `npm build` but also live-reloads as we change files, good for development

## Possible features

- Search through all comments and show the user the most discussed / highly rated ones
- List all outbound links in HN/Reddit/etc comments (+ some context, the comment/thread?) so user can find relevant followup material
- Rank comments by relevancy (vs random off-topic comments)
- Show comments on top of the article in the right places (very difficult, need to know how to link text content in article to comments)

## Resources to create this

- https://thacoon.com/posts/create-react-app-browser-extension-with-tailwind/ -- to create the base repo, except didn't use craco (tailwind works with CRA without craco now)
- https://gist.github.com/mmazzarolo/0bec410e071a39d54d780abfcf3b72e7 -- for live reloading of extension

## Understanding extensions

- Sub-files in an extension, pointed to by `manifest.json`
  - `background`: launched when extension is launched, access to all APIs but no access to DOM
  - `popup`: launched when extension buttton is clicked (pretty much like options, but just a popup)
  - `options`: standalone options page for extension
  - `content`: launched in a tab which matches a particular set of URLs (can be all URLs, specified in manifest)
