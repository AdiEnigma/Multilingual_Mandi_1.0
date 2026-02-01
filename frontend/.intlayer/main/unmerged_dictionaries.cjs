const _unMQPF71HeGlSQ7XEoz1 = require('../unmerged_dictionary/common.json');
const _A7DyY6NGOe0DTU3muX2U = require('../unmerged_dictionary/listings.json');

const dictionaries = {
  "common": _unMQPF71HeGlSQ7XEoz1,
  "listings": _A7DyY6NGOe0DTU3muX2U
};
const getUnmergedDictionaries = () => dictionaries;

module.exports.getUnmergedDictionaries = getUnmergedDictionaries;
module.exports = dictionaries;
