/**
 * Processes incoming URLs and removes those that are blacklisted
 * */

const firefoxBlacklist = [
  "accounts-static.cdn.mozilla.net",
  "accounts.firefox.com",
  "addons.cdn.mozilla.net",
  "addons.mozilla.org",
  "api.accounts.firefox.com",
  "content.cdn.mozilla.net",
  "content.cdn.mozilla.net",
  "discovery.addons.mozilla.org",
  "input.mozilla.org",
  "install.mozilla.org",
  "oauth.accounts.firefox.com",
  "profile.accounts.firefox.com",
  "support.mozilla.org",
  "sync.services.mozilla.com",
  "testpilot.firefox.com",
];

/**
 * Removes blacklisted urls
 * TODO: add a user-editable blocklist (requires storage)
 * */
export function isBlacklisted(url: string): boolean {
  for (const blackListedUrl of firefoxBlacklist) {
    if (url.includes(blackListedUrl)) return true;
  }

  return false;
}
