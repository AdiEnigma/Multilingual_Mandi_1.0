const _Ti7rVp9fRNuQ6pnMCd9W = require('../dictionary/common.json');
const _YJjLh4VAwccPZ3NCdkhT = require('../dictionary/listings.json');

const dictionaries = {
  "common": _Ti7rVp9fRNuQ6pnMCd9W,
  "listings": _YJjLh4VAwccPZ3NCdkhT
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
