const proxy = require('../utils/proxy');

test('Returns unproxied URL without changing it', () => {
  const url = "https://jestjs.io/docs/using-matchers"
  const unproxiedUrl = proxy.unproxyUrl(url);
  expect(unproxiedUrl).toEqual(url);

})

test('Unproxies NUS proxy', () => {
  const url = "https://dl-acm-org.libproxy1.nus.edu.sg/doi/10.1145/3485730.3485941"
  const expectedUrl = "https://dl.acm.org/doi/10.1145/3485730.3485941"
  const unproxiedUrl = proxy.unproxyUrl(url);
  expect(unproxiedUrl).toEqual(expectedUrl);

})
