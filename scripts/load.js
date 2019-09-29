const ost = require('../OST');
const fs = require('fs');
const { VERSION_DICT } = require('./util');
const mapValues = require('lodash.mapvalues');
const difference = require('lodash.difference');

module.exports = input => {
  const fileContents = fs.readFileSync(input, { encoding: 'utf8' });
  const configObj = JSON.parse(fileContents);

  const diff = difference(Object.keys(configObj), Object.keys(ost));

  if (!configObj || diff.length) {
    return {
      ok: false,
      error: 'You have provided an invalid configuration file.'
    };
  }

  const contents = mapValues(configObj, val => VERSION_DICT[val]);

  return {
    ok: true,
    contents
  };
};
