import '@testing-library/jest-dom';

// JSDOM mock for scrollBy
if (typeof Element !== 'undefined' && !Element.prototype.scrollBy) {
  Element.prototype.scrollBy = function () {};
}
