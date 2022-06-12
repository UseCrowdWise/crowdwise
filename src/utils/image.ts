// In the Chrome extension, chrome.runtime.getURL will work but locally it will not work
export const getImageUrl = (url: string) => {
  try {
    return chrome.runtime.getURL(url);
  } catch (e) {
    return url;
  }
};
