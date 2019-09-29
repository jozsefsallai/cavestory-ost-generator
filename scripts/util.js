const fs = require('fs');
const path = require('path');

module.exports.isValidInstallation = input => {
  const remasteredPath = path.join(input, 'data', 'base', 'Ogg11');
  const newSoundtrackPath = path.join(input, 'data', 'base', 'Ogg');

  if (!fs.existsSync(remasteredPath)) {
    return {
      ok: false,
      error: 'Remastered soundtrack not found.'
    };
  }

  if (!fs.existsSync(newSoundtrackPath)) {
    return {
      ok: false,
      error: 'Cave Story+ (New) soundtrack not found.'
    };
  }

  return {
    ok: true
  };
};

module.exports.truncate = str => {
  if (str.length > 40) {
    return `${str.substr(0, 37)}...`;
  }

  return str;
};

const invert = require('lodash.invert');

const VERSION_DICT = {
  remastered: 0,
  organya: 1,
  plus: 2
};

Object.assign(VERSION_DICT, invert(VERSION_DICT));

module.exports.VERSION_DICT = VERSION_DICT;
