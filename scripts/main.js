const { remote } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const mapValues = require('lodash.mapvalues');
const { isValidInstallation, truncate, VERSION_DICT } = require('./util');
const OSTGenerator = require('./generate');

const load = require('./load');

const ost = remote.getGlobal('ost');
const dialog = remote.dialog;

const tracksDiv = document.querySelector('.tracks');

const installationPathInput = document.querySelector('.installation-path');

const selectPrompt = tracksDiv.innerHTML;
const buttons = {
  generate: document.querySelector('.generate-button'),
  save: document.querySelector('.save-button'),
  load: document.querySelector('.load-button')
};

const optionsTemplate = `<option value="0">Remastered (Cave Story 3D)</option>
  <option value="1" {{isOrgDisabled}}>Organya (original)</option>
  <option value="2" {{isNewDisabled}}>New (Cave Story+)</option>`;

let dict = mapValues(ost, () => 0);

function getTracks() {
  tracksDiv.innerHTML = '';

  Object.keys(ost).forEach(key => {
    const track = document.createElement('div');
    track.classList.add('track');
  
    let name;
    let aliases;
    
    let currentOptionSelectorHTML = optionsTemplate;
    let isOrgDisabled = '';
    let isNewDisabled = '';

    if (typeof ost[key] === 'object') {
      if (ost[key].aliases) {
        aliases = document.createElement('em');
        aliases.innerHTML = `Aliases: ${ost[key].aliases.join(', ')}`;
      }

      const versions = ost[key].availableVersions || null;

      if (versions) {

        if (!versions.includes(1)) {
          isOrgDisabled = 'disabled';
        }

        if (!versions.includes(2)) {
          isNewDisabled = 'disabled';
        }
      }

      name = ost[key].name;
    } else {
      name = ost[key];
    }

    const trackData = document.createElement('div');
    trackData.classList.add('track-data');

    const trackName = document.createElement('strong');
    trackName.innerHTML = `${name} <small>${key}</small>`;

    trackData.appendChild(trackName);

    if (aliases) {
      trackData.appendChild(aliases);
    }

    track.appendChild(trackData);

    const selectElement = document.createElement('select');
    selectElement.setAttribute('data-key', key);
    selectElement.onchange = function () {
      dict[key] = parseInt(this.value);
    };

    currentOptionSelectorHTML = currentOptionSelectorHTML.replace('{{isOrgDisabled}}', isOrgDisabled);
    currentOptionSelectorHTML = currentOptionSelectorHTML.replace('{{isNewDisabled}}', isNewDisabled);

    selectElement.innerHTML = currentOptionSelectorHTML;
    
    const selectionContainer = document.createElement('div');
    selectionContainer.classList.add('selection-container');
    selectionContainer.appendChild(selectElement);
    track.appendChild(selectionContainer);

    tracksDiv.appendChild(track);
  });
}

window.onload = function () {
  if (!fs.existsSync(path.join(remote.app.getAppPath(), 'data', 'org'))) {
    dialog.showErrorBox('Error', 'The data/org folder is missing. Please download it and place it in the root of the application.');
    return remote.getCurrentWindow().close();
  }
}

installationPathInput.onchange = async function (e) {
  const label = e.currentTarget.previousElementSibling;
  tracksDiv.innerHTML = selectPrompt;
  label.innerHTML = 'Select...';

  buttons.generate.disabled = true;
  buttons.save.disabled = true;
  buttons.load.disabled = true;

  const path = e.currentTarget.files[0].path;
  const isValid = isValidInstallation(path);

  if (!isValid.ok) {
    return dialog.showMessageBox({
      type: 'error',
      title: 'Invalid installation path',
      message: `The provided installation path is invalid. Error: ${isValid.error}`
    });
  }

  label.innerHTML = truncate(path);

  buttons.generate.disabled = false;
  buttons.save.disabled = false;
  buttons.load.disabled = false;

  return getTracks();
};

buttons.save.onclick = function (e) {
  e.preventDefault();

  const config = mapValues(dict, val => VERSION_DICT[val]);
  const textConfig = JSON.stringify(config, null, 2);
  
  dialog.showSaveDialog({
    title: 'Save Config File',
    filters: [
      { name: 'JSON Config Files', extensions: [ 'json' ] }
    ]
  }, function (file) {
    return fs.writeFile(file, textConfig, { encoding: 'utf8' }, err => {
      if (err) {
        return dialog.showMessageBox({
          type: 'error',
          title: 'Error',
          message: 'Failed to save the config file.'
        });
      }

      return dialog.showMessageBox({
        type: 'info',
        title: 'Success!',
        message: 'The config file has been saved successfully!'
      });
    });
  });
};

buttons.load.onclick = function (e) {
  e.preventDefault();

  dialog.showOpenDialog({
    title: 'Open Config File',
    filters: [
      { name: 'JSON Config File', extensions: [ 'json' ] }
    ]
  }, function (file) {
    if (!file || !file.length) {
      return;
    }

    const response = load(file[0]);

    if (!response.ok) {
      return dialog.showMessageBox({
        type: 'error',
        title: 'Error!',
        message: response.error
      });
    }

    dict = response.contents;
    
    Object.keys(dict).forEach(key => {
      const targetSelect = document.querySelector(`select[data-key=${key}]`);
      targetSelect.value = dict[key];
    });

    return dialog.showMessageBox({
      type: 'info',
      title: 'Success!',
      message: 'Config file loaded successfully!'
    });
  });
};

buttons.generate.onclick = function (e) {
  e.preventDefault();
  const gameLocation = installationPathInput.files[0].path;
  const generator = new OSTGenerator({ gameLocation, dict });

  generator
    .start()
    .then(function () {
      return dialog.showMessageBox({
        type: 'info',
        title: 'Success!',
        message: 'The tracks have been generated successfully!',
        detail: 'To activate the OST, go to the Game Options and select the Remastered soundtrack.'
      });
    })
    .catch(err => {
      if (err.code === 'EPERM') {
        dialog.showErrorBox('Error', 'Not enough permissions to write to this folder! Please try to open the app as an administrator.');
        return remote.getCurrentWindow().close();
      }
      dialog.showErrorBox('Error', 'Failed to generate the OST. Please check the console for more details.');
      throw new Error(err);
    });
};
