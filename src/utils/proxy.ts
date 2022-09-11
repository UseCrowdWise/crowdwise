/**
 * Checks if a URL is using a known URL proxier, and if so, returns the cleaned URL (without the institutional proxy).
 * This is useful since many research articles are viewed through institituional proxies.
 * Such proxy-rewritten URLs will not be submitted to HN or Reddit, for e.g.
 *
 * E.g.,
 * original url: https://dl.acm.org/10.1145/3485730.3485941
 * proxied url (NUS): https://dl-acm-org.libproxy1.nus.edu.sg/doi/10.1145/3485730.3485941
 *
 * NOTE: scroll to end of file to see function
 * */
let proxyHosts = require("../assets/data/proxies.json");
const proxyHostsSet = new Set(proxyHosts);

export const unproxyUrl = (url: string) => {
  const urlObj = new URL(url);

  // ["dl-acm-org", "libproxy", "nus", "edu", "sg"]
  const urlHostComponents = urlObj.host.split(".");

  // "libproxy.nus.edu.sg"
  const proxyUrlHost = urlHostComponents.slice(1).join(".");

  if (proxyHostsSet.has(proxyUrlHost)) {
    // This is a proxied url, we have to unproxy
    // "dl.acm.org"
    const realDomain = urlHostComponents[0].split("-").join(".");
    // "/doi..."
    const realPath = urlObj.pathname;
    const finalUrl = urlObj.protocol + "//" + realDomain + realPath;
    return finalUrl;
  } else {
    return url;
  }
};
